package auth

import (
	"database/sql"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/utils"
	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {

	var data LoginData

	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Email Or Password Must Be Filled!",
			"status_code": http.StatusBadRequest,
			"err":         err.Error(),
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

	defer db.Close()

	var userLogged ResultUser

	err = db.QueryRow(`SELECT id, first_name, role, verified, password, status from users
		WHERE email=? AND status != 'deleted' AND role=? 
	`, data.Email, data.Role).Scan(&userLogged.ID, &userLogged.FirstName, &userLogged.Role, &userLogged.Verified, &userLogged.Password, &userLogged.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Email Yang Dimasukkan Tidak Terdaftar",
				"status_code": http.StatusNotFound,
				"err":         err.Error(),
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Want To Validate Account....",
				"status_code": http.StatusInternalServerError,
				"err":         err.Error(),
			})
		}
		return
	}

	if userLogged.Status == "unactive" {

		// Kalo bisa tambahkan send ulang aktivasi akun :D

		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Account Must Accept The Verification",
			"status_code": http.StatusForbidden,
		})
		return
	}

	isPasswordMatch := utils.CompareHashPassword(userLogged.Password, data.Password)

	if !isPasswordMatch {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Email Or Password Was Wrong!",
			"status_code": http.StatusNotFound,
		})
		return
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	// check if the user has token available
	var checkedToken TokenSession

	err = db.QueryRow(`SELECT id_user, code_otp, token, active, expired_at, is_remember FROM session
		WHERE id_user=? and active=0 and expired_at >= ?
	`, userLogged.ID, currentTimeMili).Scan(&checkedToken.UserID, &checkedToken.CodeOTP, &checkedToken.Token, &checkedToken.Active, &checkedToken.ExpiredAt, &checkedToken.IsRemember)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			token, err := utils.CreateRandomToken()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Want To Create Session Token....",
					"status_code": http.StatusInternalServerError,
					"err":         err.Error(),
				})
				return
			}

			expiredTokenAt := (60 * 30 * 1000) + currentTimeMili
			code_otp, err := utils.GenerateOTPCode()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Want To Creating OTP Code....",
					"status_code": http.StatusInternalServerError,
					"err":         err.Error(),
				})
				return
			}

			newTokenSession := &TokenSession{
				UserID: userLogged.ID,
				Token:  token,
			}

			stmt, err := db.Prepare(`INSERT INTO session(id_user, token, code_otp, active, expired_at, updated_at, created_at) 
				VALUES(?, ?, ?, ?, ?, ?, ?)
			`)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Want To Prepare Store Session Token....",
					"status_code": http.StatusInternalServerError,
					"err":         err.Error(),
				})
				return
			}

			defer stmt.Close()

			_, err = stmt.Exec(
				newTokenSession.UserID,
				newTokenSession.Token,
				code_otp,
				0,
				expiredTokenAt,
				currentTimeMili,
				currentTimeMili,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Want To Store Session Token....",
					"status_code": http.StatusInternalServerError,
					"err":         err.Error(),
				})
				return
			}

			c.SetCookieData(&http.Cookie{
				Name:     "pre-auth-token",
				Value:    newTokenSession.Token,
				Path:     "/",
				Domain:   "localhost",
				Expires:  time.Unix(int64(expiredTokenAt), 0),
				MaxAge:   60 * 30,
				Secure:   false,
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
			})

			go sendOtpCode(data.Email, userLogged.FirstName, code_otp)

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Want To Check Token....",
				"status_code": http.StatusInternalServerError,
				"err":         err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Your Credentials Is Valid, But You Must Complete 1 More Step To Access Our System!",
		"status_code": http.StatusOK,
	})
}

// func sendOtpCode(
// 	data_public *ResultUser,
// 	email string,
// 	code_otp string,
// ) {

// 	data := &models.SenderEmailNeeded{
// 		Subject: "Your Crendentials Was Valid!",
// 		Message: fmt.Sprintf(`Hello, %s,
// 		You Have Logged To Our System!
// 		Here The Code You Must Fill To Access Our System!
// 		Code : %s
// 	`, data_public.FirstName, code_otp),
// 		To: []string{email},
// 		Cc: []string{email},
// 	}

// 	err := sendemail.SendEmail(data)

// 	if err != nil {
// 		fmt.Println("There something error, when wan to send email")
// 		fmt.Println(err.Error())
// 	}
// }
