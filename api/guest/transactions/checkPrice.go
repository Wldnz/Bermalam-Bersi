package guest_transactions

import (
	"net/http"

	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

type RequestCheckPrice struct {
	Rooms      []controller.RequestRoomBookingData `json:"rooms"`
	CheckInAt  int                                 `json:"check_in_at"`
	CheckOutAt int                                 `json:"check_out_at"`
	Voucher    VoucherUsedTransaction              `json:"voucher"`
}

func CheckPrice(c *gin.Context) {

	credentials := controller.CheckCredentialsAccount(c)

	if !credentials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Please Login First To Create Booking Hotel!",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	var data RequestCheckPrice

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "The Requirement Data Must Be Filled!",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	var transaction DataTransactions

	// dapatkan level pengguna
	// 1 day
	minimumBookDayMili := (60 * 60 * 24 * 1000)
	whatLevelIsIt := data.CheckOutAt - data.CheckInAt

	if whatLevelIsIt >= minimumBookDayMili*7 {
		transaction.LevelTransaction = "long_stay"
	} else if whatLevelIsIt >= minimumBookDayMili*2 {
		transaction.LevelTransaction = "two_night"
	} else if whatLevelIsIt >= minimumBookDayMili {
		transaction.LevelTransaction = "night"
	} else {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry, You Must Book At Least 1 Day",
			"status_code": http.StatusForbidden,
		})
		return
	}

	// loop untuk mendapatkan totalHarga
	totalPriceResponse := controller.GetTotalPriceRoom(
		data.CheckInAt,
		data.CheckOutAt,
		data.Rooms,
		transaction.LevelTransaction,
	)

	if !totalPriceResponse.IsSuccess {
		if totalPriceResponse.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     totalPriceResponse.Message,
				"error":       totalPriceResponse.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     totalPriceResponse.Message,
				"error":       totalPriceResponse.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	// mendapatkan totalDiscount

	totalDiscountResponse := controller.GetTotalDiscountPrice(totalPriceResponse.TotalPrice, credentials.User.ID, data.Voucher.ID)

	if !totalDiscountResponse.IsSuccess {
		if totalDiscountResponse.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     totalDiscountResponse.Message,
				"error":       totalDiscountResponse.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     totalDiscountResponse.Message,
				"error":       totalDiscountResponse.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	transaction.TotalPrice = totalPriceResponse.TotalPrice - totalDiscountResponse.TotalDiscountPrice
	// wkwk, ada calculation dlu sblm dia bener" creatTransaction wkwkwk
	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Calculating Price!",
		"data": &ResponseTotalPrice{
			TotalPrice:    transaction.TotalPrice,
			TaxCost:       3000,
			DiscountPrice: totalDiscountResponse.TotalDiscountPrice,
		},
		"status_code": http.StatusOK,
	})
}
