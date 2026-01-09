package controller

import (
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultAccountData struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Verified  string `json:"verified"`
	Status    string `json:"status"`
}

type ResponseCrendtialsAccount struct {
	IsAuthorized bool
	User         ResultAccountData
}

func CheckCredentialsAccount(c *gin.Context) ResponseCrendtialsAccount {

	cookie, err := c.Request.Cookie("auth-token")

	if err != nil {
		return ResponseCrendtialsAccount{
			IsAuthorized: false,
		}
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseCrendtialsAccount{
			IsAuthorized: false,
		}
	}

	var user ResultAccountData

	currentTimeMili := time.Now().UnixMilli()

	err = db.QueryRow(`SELECT u.id, u.first_name, u.last_name, u.email,  u.role, u.verified, u.status 
		FROM session s
			INNER JOIN users u
			ON u.id = s.id_user
		WHERE s.token = ? AND s.active = 1 AND expired_at >= ?		
	`, cookie.Value, currentTimeMili).Scan(&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Role, &user.Verified, &user.Status)

	if err != nil {
		return ResponseCrendtialsAccount{
			IsAuthorized: false,
		}
	}

	return ResponseCrendtialsAccount{
		IsAuthorized: true,
		User:         user,
	}

}
