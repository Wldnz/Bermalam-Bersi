package auth

import (
	"database/sql"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/utils"
	"github.com/gin-gonic/gin"
)

type ResponseActivateLink struct {
	IsSuccess    bool
	Category     string
	Token        string
	Message      string
	ErrorMessage string
}

type ResultActiveToken struct {
	token string
}

type ResultCheckingSession struct {
	ID        int
	FirstName string
	Email     string
}

func SendBackActiavateAccunt(
	c *gin.Context,
) {

	cookie, err := c.Request.Cookie("pre-auth-token")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Sorry, u dont have any token to activate account",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	var resultData ResultCheckingSession

	if err := db.QueryRow(`SELECT u.id, u.first_name, u.email FROM session s 
		INNER JOIN users u
			ON u.id = s.id_user
				WHERE s.token=?
	`, cookie.Value).Scan(&resultData.ID, &resultData.FirstName, &resultData.Email); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Checking Token!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	response := SendBackActivate(resultData.ID)

	if !response.IsSuccess {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     response.Message,
			"error":       response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	expiredTime := (60 * 60 * 24 * 1000) + time.Now().UnixMilli()

	c.SetCookieData(&http.Cookie{
		Name:     "verification-token",
		Value:    response.Token,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTime), 0),
		MaxAge:   60 * 60 * 24,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	go sendActivateToken(
		[]string{resultData.Email},
		[]string{resultData.Email},
		resultData.FirstName,
		int64(resultData.ID),
		resultData.Email,
		response.Token,
	)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Successfully Send Back Activate Link!",
		"status_code": http.StatusOK,
	})

}

func SendBackActivate(
	user_id int,
) ResponseActivateLink {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseActivateLink{
			IsSuccess:    false,
			Category:     "ERROR",
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
		}
	}

	defer db.Close()

	currentTime := time.Now()
	currenTimeMili := currentTime.UnixMilli()
	expiredAt := (60 * 60 * 24 * 1000) + currenTimeMili

	var resultToken ResultActiveToken

	newToken, err := utils.CreateRandomToken()

	if err != nil {
		return ResponseActivateLink{
			IsSuccess:    false,
			Category:     "ERROR",
			Message:      "There's Something Error When Creating Token",
			ErrorMessage: err.Error(),
		}
	}

	err = db.QueryRow(`SELECT token FROM auth_token 
		WHERE id_user=? AND category='active' AND used='0'AND expired_at>=?
	`, user_id, currenTimeMili).Scan(&resultToken.token)

	if err != nil {
		if err == sql.ErrNoRows {
			stmt, err := db.Prepare(`INSERT INTO auth_token(id_user, token, expired_at, used, category, created_at, updated_at, created_by, updated_by)
				VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`)

			if err != nil {
				return ResponseActivateLink{
					Message:      "There Something Error When Want To Prepare To Insert New Link",
					ErrorMessage: err.Error(),
					IsSuccess:    false,
					Category:     "ERROR",
				}
			}

			defer stmt.Close()

			_, err = stmt.Exec(
				user_id,
				newToken,
				expiredAt,
				0,
				"activate",
				currenTimeMili,
				currenTimeMili,
				user_id,
				user_id,
			)

			if err != nil {
				return ResponseActivateLink{
					Message:      "There Something Error When Want To Insert New Link Into Database",
					ErrorMessage: err.Error(),
					IsSuccess:    false,
					Category:     "ERROR",
				}
			}

			return ResponseActivateLink{
				Message:   "Succesffully Created New Token Activate!",
				IsSuccess: true,
				Category:  "SUCCESS",
				Token:     newToken,
			}

		} else {
			return ResponseActivateLink{
				IsSuccess:    false,
				Category:     "ERROR",
				Message:      "There's Something Error When Getting Token",
				ErrorMessage: err.Error(),
			}
		}
	}

	stmt, err := db.Prepare(`UPDATE auth_token SET token=?, expired_at=?, updated_at=? WHERE token=?`)

	if err != nil {
		return ResponseActivateLink{
			Message:      "There Something Error When Want To Prepare To Update New Link",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
			Category:     "ERROR",
		}
	}

	defer stmt.Close()

	res, err := stmt.Exec(
		newToken,
		expiredAt,
		currenTimeMili,
		resultToken.token,
	)

	if err != nil {
		return ResponseActivateLink{
			Message:      "There Something Error When Want To Update New Link Into Database",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
			Category:     "ERROR",
		}
	}

	totalAffectedRows, err := res.RowsAffected()

	if err != nil {
		return ResponseActivateLink{
			Message:      "There's Nothing Changed...",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
			Category:     "ERROR",
		}
	}

	if totalAffectedRows == 0 {
		return ResponseActivateLink{
			Message:   "There's Nothing Changed...",
			IsSuccess: false,
		}
	}

	return ResponseActivateLink{
		Message:   "Succesffully Updated New Token Activate!",
		IsSuccess: true,
		Category:  "SUCCESS",
		Token:     newToken,
	}

}
