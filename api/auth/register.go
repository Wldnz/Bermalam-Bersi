package auth

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/models"
	"bersi.bermalam.id/utils"
	sendemail "bersi.bermalam.id/utils/sendEmail"
	"github.com/gin-gonic/gin"
)

type ResponseRegisterGuestAccount struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	Role      string `json:"role"`
	Verified  bool   `json:"verified"`
	Status    string `json:"status"`
}

func RegisterMitra(c *gin.Context) {

	var data RegisterMitrAccount

	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Make Sure The Requirement Data Has Send!",
			"error":   err.Error(),
		})
		return
	}

	// masukan ke dalam database

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Connect Into Database...",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

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

	currentTime := time.Now()
	currentTimeStamp := currentTime.UnixMilli()

	hashedPassword, err := utils.CreateHashPassword(data.Password)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Hash Password",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	res, err := stmt.Exec(
		data.FirstName,
		data.LastName,
		data.Email,
		data.PhoneCode,
		data.Phone,
		hashedPassword,
		"hotel_owner",
		"unactive",
		currentTimeStamp,
		currentTimeStamp,
	)

	if err != nil {
		if strings.Contains(err.Error(), "Error 1062 (23000)") {
			c.JSON(http.StatusConflict, gin.H{
				"message":     "EMAIL ALREADY EXIST",
				"error":       err.Error(),
				"status_code": http.StatusConflict,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There Something Error When Want To Store Account...",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	lastId, err := res.LastInsertId()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Wan To Get ID User",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// res.RowsAffected()
	// database was closed in this function also this function adding some cookie to validate

	stringToken, err := utils.CreateRandomToken()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Creating Token..",
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	currentTimeMili := currentTime.UnixMilli()
	expiredTime := (60 * 60 * 24 * 1000) + currentTimeMili

	c.SetCookieData(&http.Cookie{
		Name:     "verification-token",
		Value:    stringToken,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTime), 0),
		MaxAge:   60 * 60 * 24,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	go createActivateToken(stringToken, &data, lastId, db)

	c.JSON(http.StatusCreated, gin.H{
		"message":     fmt.Sprintf("Creating Account With Name %s Was Succefully", data.FirstName),
		"status_code": http.StatusCreated,
	})

}

func ResgiterGuest(c *gin.Context) {

	var data RegisterGuestAccount

	if err := c.BindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Make Sure The Requirement Data Has Send!",
			"error":   err.Error(),
		})
		return
	}

	// masukan ke dalam database

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Connect Into Database...",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	stmt, err := db.Prepare(`INSERT INTO users(first_name, last_name, email, phone_country_code, phone, password, role, status, created_at, updated_at)
		values(?, ?, ?, ?, ?, ?, ? ,?, ?, ?)
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

	currentTime := time.Now()
	currentTimeStamp := currentTime.UnixMilli()

	hashedPassword, err := utils.CreateHashPassword(data.Password)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Hash Password",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	res, err := stmt.Exec(
		data.FirstName,
		data.LastName,
		data.Email,
		0,
		"",
		hashedPassword,
		"guest",
		"unactive",
		currentTimeStamp,
		currentTimeStamp,
	)

	if err != nil {
		if strings.Contains(err.Error(), "Error 1062 (23000)") {
			c.JSON(http.StatusConflict, gin.H{
				"message":     "EMAIL ALREADY EXIST",
				"error":       err.Error(),
				"status_code": http.StatusConflict,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There Something Error When Want To Store Account...",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	lastId, err := res.LastInsertId()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Wan To Get ID User",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// res.RowsAffected()
	// database was closed in this function also this function adding some cookie to validate

	stringToken, err := utils.CreateRandomToken()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Creating Token..",
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	currentTimeMili := currentTime.UnixMilli()
	expiredTime := (60 * 60 * 24 * 2 * 1000) + currentTimeMili

	res, err = db.Exec(`INSERT INTO session(id_user, token, code_otp, active, expired_at, created_at, updated_at) 
				VALUES(?, ?, ?, ?, ?, ?, ?)
	`, lastId, stringToken, 0, 1, expiredTime, currentTimeMili, currentTimeMili)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Store Session",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	c.SetCookieData(&http.Cookie{
		Name:     "auth-token",
		Value:    stringToken,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTime), 0),
		MaxAge:   60 * 60 * 24 * 2,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	c.JSON(http.StatusCreated, gin.H{
		"message": fmt.Sprintf("Creating Account With Name %s Was Succefully", data.FirstName),
		"data": ResponseRegisterGuestAccount{
			ID:        int(lastId),
			FirstName: data.FirstName,
			Role:      "guest",
			Verified:  false,
			Status:    "unactive",
		},
		"status_code": http.StatusCreated,
	})

}

func sendActivateToken(
	to []string,
	cc []string,
	name string,
	user_id int64,
	email string,
	token string,
) {

	data := &models.SenderEmailNeeded{
		Subject: "Congratulations Your Account Has Succesfully Register!",
		Message: fmt.Sprintf(`Hello, %s\n
		Congratulations, Your Account Has Been Created! \n
		Now Please Activate Your Account!
		Click Link In Below!
		<a href='http://localhost:8000/activate-account?token=%s&user_id=%d&email=%s'>Aktifkan Sekarang!</a>
	`, name, token, user_id, email),
		To: to,
		Cc: cc,
	}

	if err := sendemail.SendEmail(data); err != nil {
		fmt.Println("There Something error When Wan To Send Into Email")
		fmt.Println(err.Error())
	}

}

func createActivateToken(
	token string,
	data *RegisterMitrAccount,
	user_id int64,
	db *sql.DB,
) {
	defer db.Close()

	stmt, err := db.Prepare(`INSERT INTO auth_token(id_user, token, expired_at, used, category, created_at, updated_at, created_by, updated_by)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)

	if err != nil {
		fmt.Printf("There something error when prepare to insert token into database")
		fmt.Println(err.Error())
		return
	}

	defer stmt.Close()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()
	expiredTime := (60 * 60 * 24 * 1000) + currentTimeMili
	_, err = stmt.Exec(
		user_id,
		token,
		expiredTime,
		0,
		"activate",
		currentTimeMili,
		currentTimeMili,
		user_id,
		user_id,
	)

	if err != nil {
		fmt.Printf("There something error when insert token into database")
		fmt.Println(err.Error())
		return
	}

	fmt.Println("setting cookiue...")

	to := []string{data.Email}
	cc := []string{"wildanizharlhaqq@gmail.com"}

	go sendActivateToken(to, cc, data.FirstName, user_id, data.Email, token)
}
