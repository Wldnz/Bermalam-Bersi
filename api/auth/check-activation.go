package auth

import (
	"database/sql"
	"net/http"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultCheckingAccount struct {
	ID     int    `json:"id"`
	Status string `json:"status"`
}

func CheckActivactionAccount(c *gin.Context) {

	cookie, err := c.Request.Cookie("verification-token")

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry, We cannot process...",
			"status_code": http.StatusForbidden,
			"err":         err.Error(),
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Something Error",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	var checkingAccount ResultCheckingAccount

	err = db.QueryRow(`SELECT u.id, u.status FROM users u
		INNER JOIN auth_token au
			ON au.id_user = u.id 
				WHERE token=? AND category = 'activate'
	`, cookie.Value).Scan(&checkingAccount.ID, &checkingAccount.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "We Cannot Found Account Or Token...",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Something Error When Checking Status Account",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	if checkingAccount.Status == "unactive" {
		c.JSON(http.StatusOK, gin.H{
			"message":     "Status Account Still Unactive!",
			"verified":    false,
			"status_code": http.StatusOK,
		})
		return
	}

	c.SetCookieData(&http.Cookie{
		Name:   "verification-token",
		MaxAge: -1,
	})

	c.JSON(http.StatusOK, gin.H{
		"message":     "Account Status Was Active!",
		"verified":    true,
		"status_code": http.StatusOK,
	})

}
