package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/lib"
	"bersi.bermalam.id/utils"
	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
)

type ResponseAuthURL struct {
	URL string `json:"url"`
}

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

	switch data.Role {
	case "mitra":
		data.Role = "hotel_owner"
	case "mitra_receptionist":
		data.Role = "receptionist"
	default:
		data.Role = "guest"
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

	cookieName := "pre-auth-token"

	if userLogged.Role == "guest" {
		cookieName = "auth-token"
	}

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

			active := 0

			if userLogged.Role == "guest" {
				active = 1
			}

			_, err = stmt.Exec(
				newTokenSession.UserID,
				newTokenSession.Token,
				code_otp,
				active,
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
				Name:     cookieName,
				Value:    newTokenSession.Token,
				Path:     "/",
				Domain:   "localhost",
				Expires:  time.Unix(int64(expiredTokenAt), 0),
				MaxAge:   60 * 30,
				Secure:   false,
				HttpOnly: true,
				SameSite: http.SameSiteLaxMode,
			})

			if userLogged.Status == "active" && userLogged.Role != "guest" {
				go sendOtpCode(data.Email, userLogged.FirstName, code_otp)
			}

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Want To Check Token....",
				"status_code": http.StatusInternalServerError,
				"err":         err.Error(),
			})
			return
		}
	}

	if checkedToken.UserID != 0 {
		maxAgeCookie := (checkedToken.ExpiredAt - currentTimeMili) / 1000

		c.SetCookieData(&http.Cookie{
			Name:     cookieName,
			Value:    checkedToken.Token,
			Path:     "/",
			Domain:   "localhost",
			Expires:  time.Unix(int64(checkedToken.ExpiredAt), 0),
			MaxAge:   int(maxAgeCookie),
			Secure:   false,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
	}

	if userLogged.Role == "guest" {
		c.JSON(http.StatusOK, gin.H{
			"message":     "Your Credentials Is Valid!",
			"status_code": http.StatusOK,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"message":           "Your Credentials Is Valid, But You Must Complete 1 More Step To Access Our System!",
			"is_account_active": userLogged.Status == "active",
			"status_code":       http.StatusOK,
		})
	}

}

func LoginWithGoogle(c *gin.Context) {

	response := lib.CreateOAuth2Token(c)

	if !response.IsSuccess {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     response.Message,
			"error":       response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Create Token But You Need To Sign In Here...",
		"data": ResponseAuthURL{
			URL: response.Data.URL,
		},
		"status_code": http.StatusOK,
	})

}

func LoginWithGoogleCallBack(c *gin.Context) {

	cookie, err := c.Request.Cookie("pre-auth-google")

	state := c.Query("state")
	code := c.Query("code")

	fmt.Println("================callback-google-sent")
	fmt.Println(state)
	fmt.Println(code)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Sorry... We Cannot Process Your Request...",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	if state != cookie.Value {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Sorry... We Cannot Process Your Invalid Oauth2 Token...",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	response := lib.GetGoogleAccountData(code)

	if !response.IsSuccess {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     response.Message,
			"error":       response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// apakah akun sudah ada?
	// jika belum buatkan akun baru...
	// buatkan session

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	query := `SELECT id, first_name, verified, status, role FROM users WHERE email=?`

	var userLogged ResultUser

	if err = db.QueryRow(query, response.Data.User.Email).Scan(&userLogged.ID, &userLogged.FirstName, &userLogged.Verified, &userLogged.Status, &userLogged.Role); err != nil {
		if err == sql.ErrNoRows {

			userLogged.Password = os.Getenv("DEFAULT_PASSWORD_REGISTER_GOOGLE")
			userLogged.Role = "guest"
			userLogged.Status = "active"

			stmt, err := db.Prepare(`INSERT INTO users(first_name, last_name, email, phone_country_code, phone, password, role, status, created_at, updated_at)
				values(?, ?, ?, ?, ?, ?, ?, ?, ? ,?)
			`)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Want To Store Account",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			defer stmt.Close()

			res, err := stmt.Exec(
				strings.Split(response.Data.User.Email, "@")[0],
				"",
				response.Data.User.Email,
				62,
				0,
				userLogged.Password, // pasword
				userLogged.Role,
				userLogged.Status,
				currentTimeMili,
				currentTimeMili,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Store New Guest Account...",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			last_id, err := res.LastInsertId()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Getting User ID ...",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			userLogged.ID = int(last_id)

		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Checking Account On Database",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
	}

	// JIKA AKUNNYA BUKAN 'TAMU' MAKA AKAN SAYA KASIH AKASES FORBIDDEN / NOT FOUND HAHAH

	if userLogged.Role != "guest" {
		c.SetCookieData(&http.Cookie{
			Name:   "pre-auth-google",
			MaxAge: -1,
		})
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry.. We Cannot Process Account Cause You Are Not Guest",
			"status_code": http.StatusForbidden,
		})
		return
	}

	// buatkan sesi baru...

	token, err := utils.CreateRandomToken()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Create Session Token....",
			"status_code": http.StatusInternalServerError,
			"err":         err.Error(),
		})
		return
	}

	expiredTokenAt := (60 * 60 * 24 * 2 * 1000) + currentTimeMili

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
		1111,
		1,
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
		Name:   "pre-auth-google",
		MaxAge: -1,
	})

	c.SetCookieData(&http.Cookie{
		Name:     "auth-token",
		Value:    newTokenSession.Token,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTokenAt), 0),
		MaxAge:   60 * 60 * 24 * 2,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Getting Information Data",
		"data":    response.Data.User.Email,
	})

}
