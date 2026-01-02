package auth

import (
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

func CheckCurrentSection(c *gin.Context) {

	cookie, err := c.Request.Cookie("auth-token")

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Sorry We Cannot Procsssess",
			"code":    http.StatusForbidden,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error....",
			"status_code": http.StatusInternalServerError,
			"err":         err.Error(),
		})
		return
	}

	var user ResultUser

	currentTimeMili := time.Now().UnixMilli()

	err = db.QueryRow(`SELECT u.id, u.first_name, u.role, u.verified, u.status 
		FROM session s
			INNER JOIN users u
			ON u.id = s.id_user
		WHERE s.token = ? AND s.active = 1 AND expired_at >= ?		
	`, cookie.Value, currentTimeMili).Scan(&user.ID, &user.FirstName, &user.Role, &user.Verified, &user.Status)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Cannot Find Token Or Token Expired!",
				"status_code": http.StatusNotFound,
				"err":         err.Error(),
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error....",
				"status_code": http.StatusInternalServerError,
				"err":         err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Success Get Current Session",
		"status_code": http.StatusOK,
		"data":        user,
	})

}
