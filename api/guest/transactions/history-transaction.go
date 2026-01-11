package guest_transactions

import (
	"net/http"
	"strconv"

	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

func HistoryTransactions(c *gin.Context) {

	credentials := controller.CheckCredentialsAccount(c)

	if !credentials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Please Login...",
			"statud_code": http.StatusUnauthorized,
		})
		return
	}

	currentIndex := c.DefaultQuery("index", "1")

	currentIndexInt, err := strconv.Atoi(currentIndex)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "There's Something Eror When Converting Into Int",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	transactions := controller.GetHistoryTransactions(credentials.User.ID, currentIndexInt)

	if !transactions.IsSuccess {
		if transactions.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     transactions.Message,
				"error":       transactions.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     transactions.Message,
				"error":       transactions.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     transactions.Message,
		"data":        transactions.Data,
		"statud_code": http.StatusOK,
	})

}

func DetailTransaction(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Please bring the ID!",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	crendetials := controller.CheckCredentialsAccount(c)

	if !crendetials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Please Login First To Access...",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	data := controller.GetDetailHistoryTransaction(crendetials.User.ID, id)

	if !data.IsSuccess {
		if data.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     data.Message,
				"error":       data.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     data.Message,
				"error":       data.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     data.Message,
		"data":        data.Data,
		"status_code": http.StatusOK,
	})

}
