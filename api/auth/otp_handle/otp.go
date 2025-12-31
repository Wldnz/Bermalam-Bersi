package otp_handle

import (
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/models"
	"bersi.bermalam.id/utils"
	sendemail "bersi.bermalam.id/utils/sendEmail"
	"github.com/gin-gonic/gin"
)

type RequestVerificationOTP struct {
	CodeOTP int `json:"code_otp"`
}

type TokenSession struct {
	ID         int    `json:"id"`
	UserID     int    `json:"id_user"`
	FirstName  string `json:"first_name"`
	Email      string `json:"email"`
	CodeOTP    int    `json:"code_otp"`
	Token      string `json:"token"`
	Active     int    `json:"active"`
	ExpiredAt  int64  `json:"expired_at"`
	IsRemember bool   `json:"is_remember"`
}

func VerificationOTP(c *gin.Context) {

	var data RequestVerificationOTP

	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Make Sure That code_otp Given!",
			"error":   err.Error(),
			"code":    http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error!",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	cookie, err := c.Request.Cookie("pre-auth-token")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Make Sure You Have The Token To Validate!",
			"error":   err.Error(),
			"code":    http.StatusBadRequest,
		})
		return
	}

	var checkedToken TokenSession

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	err = db.QueryRow(`SELECT s.id, s.id_user, u.first_name, u.email ,token, code_otp, active, expired_at, is_remember FROM session s
		INNER JOIN users u ON s.id_user = u.id 
		WHERE code_otp=? AND  token=? AND active=0 AND expired_at >= ?
	`, data.CodeOTP, cookie.Value, currentTimeMili).Scan(&checkedToken.ID, &checkedToken.UserID, &checkedToken.FirstName, &checkedToken.Email, &checkedToken.Token, &checkedToken.CodeOTP, &checkedToken.Active, &checkedToken.ExpiredAt, &checkedToken.IsRemember)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Cannot Found OTP CODE",
				"error":   err.Error(),
				"code":    http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "There's Something Error When Checking OTP CODE",
				"error":   err.Error(),
				"code":    http.StatusInternalServerError,
			})
		}
		return
	}

	// kirim email bahwasanya login berhasil dan ubah active token dan expirednya!

	var day int
	day = 2
	if checkedToken.IsRemember {
		day = 7
	}

	newExpiredTime := (60 * 60 * 24 * day * 1000) + int(currentTimeMili)

	stmt, err := db.Prepare(`UPDATE session SET active=1, expired_at=?, updated_at=?
		WHERE id=?
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Prepare To Update Token",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	_, err = stmt.Exec(
		newExpiredTime,
		newExpiredTime,
		checkedToken.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Update Token",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	go sendSuccessFullyLogin(checkedToken.FirstName, checkedToken.Email)
	c.SetCookieData(&http.Cookie{
		Name:   "pre-auth-token",
		MaxAge: -1,
	})
	c.SetCookieData(&http.Cookie{
		Name:     "auth-token",
		Value:    checkedToken.Token,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(newExpiredTime), 0),
		MaxAge:   60 * 60 * 24 * day,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "The Token Was Valid!",
		"code":    http.StatusOK,
	})

}

func SendBackOTP(c *gin.Context) {

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error!",
			"error":   err.Error(),
			"code":    http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	cookie, err := c.Request.Cookie("pre-auth-token")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Make Sure You Have The Token To Validate!",
			"error":   err.Error(),
			"code":    http.StatusBadRequest,
		})
		return
	}

	var checkedToken TokenSession

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	err = db.QueryRow(`SELECT s.id, u.first_name, u.email ,token, code_otp, active, expired_at, is_remember FROM session s
		INNER JOIN users u ON s.id_user = u.id 
		WHERE token=? AND active=0 AND expired_at >= ?
	`, cookie.Value, currentTimeMili).Scan(&checkedToken.ID, &checkedToken.FirstName, &checkedToken.Email, &checkedToken.Token, &checkedToken.CodeOTP, &checkedToken.Active, &checkedToken.ExpiredAt, &checkedToken.IsRemember)

	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			// kalo ini langsung arahin ke login aja!....
			c.SetCookieData(&http.Cookie{
				Name:   "pre-auth-token",
				MaxAge: -1,
			})
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Your Code Was Expired Or Unavailable",
				"error":   err.Error(),
				"code":    http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "There's Something Error When Checking OTP CODE",
				"error":   err.Error(),
				"code":    http.StatusInternalServerError,
			})
		}
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

	stmt, err := db.Prepare(`UPDATE session set code_otp=?, expired_at=?, updated_at=? 
				WHERE id=?
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

	res, err := stmt.Exec(
		code_otp,
		expiredTokenAt,
		currentTimeMili,
		checkedToken.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Store Session Token....",
			"status_code": http.StatusInternalServerError,
			"err":         err.Error(),
		})
		return
	}

	totalAffected, err := res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Check Affected Rows....",
			"status_code": http.StatusInternalServerError,
			"err":         err.Error(),
		})
		return
	}

	if totalAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "There's Nothing Changed...",
			"status_code": http.StatusNotFound,
			"changed":     false,
		})
		return
	}

	c.SetCookieData(&http.Cookie{
		Name:     "pre-auth-token",
		Value:    checkedToken.Token,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTokenAt), 0),
		MaxAge:   60 * 30,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	go sendOtpCode(checkedToken.Email, checkedToken.FirstName, code_otp)

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully, Send Back OTP CODE!",
		"changed": true,
		"code":    http.StatusOK,
	})

}

func sendSuccessFullyLogin(
	name string,
	email string,
) {

	data := &models.SenderEmailNeeded{
		Subject: "Successfuly Login!, Enjoy Our Services!",
		Message: fmt.Sprintf(`Hello, %s...
		If This Is Not You?, Please Contact Our!
		We Will Help You!
	`, name),
		To: []string{email},
		Cc: []string{email},
	}

	err := sendemail.SendEmail(data)

	if err != nil {
		fmt.Println("Error When Sending Succesful Login Email")
		fmt.Println(err.Error())
	}

}

func sendOtpCode(
	email string,
	name string,
	code string,
) {

	dataSendEmail := &models.SenderEmailNeeded{
		Subject: "Code Verification To Access Our System!",
		Message: fmt.Sprintf(`Hello, %s, 
		You Have Logged To Our System!
		Here The Code You Must Fill To Access Our System!
		Code : %s
	`, name, code),
		To: []string{email},
		Cc: []string{email},
	}

	err := sendemail.SendEmail(dataSendEmail)

	if err != nil {
		fmt.Println("There something error, when wan to send email")
		fmt.Println(err.Error())
	}
}
