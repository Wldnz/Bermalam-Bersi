package logout

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Logout(c *gin.Context) {

	_, err := c.Request.Cookie("auth-token")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "You Must Authorized!",
			"code":    http.StatusBadRequest,
		})
		return
	}

	c.SetCookieData(&http.Cookie{
		Name:   "auth-token",
		MaxAge: -1,
	})

	// db, err := config.ConnectToDatabase()

	// if err != nil{
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"message" : "There's Something Error...",
	// 		"error" : err.Error(),
	// 		"code" : http.StatusInternalServerError,
	// 	})
	// 	return
	// }

	// stmt, err = db.Prepare(`UPDATE session SET expired_at WHERE token=?`)

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Log-Out From Our System!",
		"code":    http.StatusOK,
	})

}
