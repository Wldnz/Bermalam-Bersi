package auth

import (
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {

	cookie, err := c.Request.Cookie("auth-token")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "You Must Authorized!",
			"code":    http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Want To Connectin Into Database...",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	db.Close()

	stmt, err := db.Prepare(`UPDATE session SET expired_at=?, updated_at=? WHERE token=?`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Want To Updating Session...",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	res, err := stmt.Exec(currentTimeMili, currentTimeMili, cookie.Value)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Updating Session...",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	totalAffected, err := res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Wan To Checking If Success Log-Out...",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	if totalAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "There's No Change About The Session...",
			"code":    http.StatusNotFound,
		})
		return
	}

	c.SetCookieData(&http.Cookie{
		Name:   "auth-token",
		MaxAge: -1,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Log-Out From Our System!",
		"code":    http.StatusOK,
	})
}
