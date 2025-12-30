package activate

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/utils"
	sendemail "bersi.bermalam.id/utils/sendEmail"
	"github.com/gin-gonic/gin"
)

type ResultCheckingToken struct {
	ID     int    `json:"id"`
	UserID int    `json:"id_user"`
	Token  string `json:"token"`
}

type TokenSession struct {
	ID         int    `json:"id"`
	FirstName  string `json:"first_name"`
	Email      string `json:"email"`
	CodeOTP    int    `json:"code_otp"`
	Token      string `json:"token"`
	Active     int    `json:"active"`
	ExpiredAt  int64  `json:"expired_at"`
	IsRemember bool   `json:"is_remember"`
}

func ActivateAccount(c *gin.Context) {

	user_id := c.Query("user_id")
	token := c.Query("token")
	email := c.Query("email")

	if user_id == "" || token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Sorry, We cannot process...",
			"status_code": http.StatusBadRequest,
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

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	var resultChecking ResultCheckingToken

	err = db.QueryRow(`SELECT id, id_user, token  from auth_token
		WHERE id_user=? and token=? and expired_at >=? and used = 0 and category = 'activate' 
	`, user_id, token, currentTimeMili).Scan(&resultChecking.ID, &resultChecking.UserID, &resultChecking.Token)

	// berhasil akan mengirimkan websocket bahwasanya aktivasi berhasil!

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Something When Checking Token",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	go MakeTokenToInactive(resultChecking.ID, db)

	stmt, err := db.Prepare(`
		UPDATE users SET status = 'active' where id=?
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something When Want to Updating Status User",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	_, err = stmt.Exec(user_id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something When Updating Status User",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	to := []string{email}
	cc := []string{"wildaizharalhaqq@gmail.com"}
	message := `Congratulations!, Your Account Has Been Activate!`
	go sendemail.SendEmail(to, cc, message)

	// send into users
	// redirect home page and create session

	token, err = utils.CreateRandomToken()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Want To Create Session Token....",
			"code":    http.StatusInternalServerError,
			"err":     err.Error(),
		})
		return
	}

	expiredTokenAt := (60 * 60 * 24 * 2 * 1000) + currentTimeMili

	stmt, err = db.Prepare(`INSERT INTO session(id_user, token, code_otp, active, expired_at, updated_at, created_at) 
				VALUES(?, ?, ?, ?, ?, ?, ?)
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Want To Prepare Store Session Token....",
			"code":    http.StatusInternalServerError,
			"err":     err.Error(),
		})
		return
	}

	defer stmt.Close()

	_, err = stmt.Exec(
		user_id,
		token,
		0000,
		1,
		expiredTokenAt,
		currentTimeMili,
		currentTimeMili,
	)

	c.SetCookieData(&http.Cookie{
		Name:     "auth-token",
		Value:    token,
		Path:     "/",
		Domain:   "localhost",
		Expires:  time.Unix(int64(expiredTokenAt), 0),
		MaxAge:   60 * 60 * 24 * 2,
		Secure:   false,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Want To Store Session Token....",
			"code":    http.StatusInternalServerError,
			"err":     err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Successfully Activate Account!",
		"status_code": http.StatusOK,
	})
}

func MakeTokenToInactive(
	token_id int,
	db *sql.DB,
) {

	stmt, err := db.Prepare("UPDATE auth_token SET used=1, updated_at=? WHERE id=?")

	if err != nil {
		fmt.Println(err.Error())
		return
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	res, err := stmt.Exec(
		currentTimeMili,
		token_id,
	)

	if err != nil {
		fmt.Println(err.Error())
		return
	}

	totalAffected, err := res.RowsAffected()

	if err != nil {
		fmt.Println(err.Error())
		return
	}

	if totalAffected == 0 {
		fmt.Println("Well, tidak ada yang berubah....")
	}

	fmt.Println("Well, Ada yang berubah....")

}
