package auth

import (
	"database/sql"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"bersi.bermalam.id/utils"
	"github.com/gin-gonic/gin"
)

type RequestBodyChangePassword struct {
	Password    string `json:"password" binding:"required, password"`
	NewPassword string `json:"new_password" binding:"required, password"`
}

func ChangePasswordAccount(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry, we cannot process..",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	var data RequestBodyChangePassword

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Please Make Sure All The Columns Are Filled!",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

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

	hashedPassword, err := utils.CreateHashPassword(data.Password)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Hashed Password",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	query := `SELECT id FROM users WHERE password =? AND id=?`

	var idUser int

	if err = db.QueryRow(query, hashedPassword, credential.User.ID).Scan(idUser); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Password Lama Tidak Sama!",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Validate The Old Password",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	hashedNewPassword, err := utils.CreateHashPassword(data.NewPassword)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Hashed The New Password",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	res, err := db.Exec(`UPDATE users SET password=?, updated_at=?, updated_by=? WHERE id=?`,
		hashedNewPassword,
		currentTimeMili,
		credential.User.ID,
		credential.User.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Updating The New Password",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	totalAffectedRows, err := res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting The Total Affected Rows",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if totalAffectedRows == 0 {
		c.JSON(http.StatusNotModified, gin.H{
			"message":     "There's No Change At Data!",
			"status_code": http.StatusNotModified,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Change Password Into The New One!",
		"status_code": http.StatusOK,
	})

}
