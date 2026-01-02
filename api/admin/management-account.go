package admin

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
	"bersi.bermalam.id/utils/storage"
	"github.com/gin-gonic/gin"
)

type ResultUserAccount struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	Email     string `json:"email"`
	CreatedAt int64  `json:"created_at"`
	Role      string `json:"role"`
	Status    string `json:"status"`
}

type RequestAccountData struct {
	FirstName             string `form:"first_name" binding:"required"`
	LastName              string `form:"last_name" binding:"required"`
	Email                 string `form:"email" binding:"required"`
	IsVerified            string `form:"is_verified" binding:"required"`
	PhoneCountryCode      string `form:"phone_country_code" binding:"required"`
	Phone                 int    `form:"phone" binding:"required"`
	Role                  string `form:"role" binding:"required"`
	Password              string `form:"password"`
	IsManualPassword      string `form:"is_manual_password" binding:"required"`
	IsSendPasswordToEmail string `form:"is_send_password_to_email"`

	IsLocationIncluded string `form:"is_location_included" binding:"required"`
	address            string `form:"address"`
	zip_code           string `form:"zip_code"`
	country            string `form:"country"`
	city               string `form:"city"`

	IsHasImage string `form:"is_has_image" binding:"required"`
}

type ResponseStatusCreatedData struct {
	IsAccountCreated         bool `json:"is_account_created"`
	IsLocationAccountCreated bool `json:"is_location_account_created"`
	IsAccountProfileCreated  bool `json:"is_account_profile_created"`
}

func GetAccounts(c *gin.Context) {

	db, err := config.ConnectToDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()

	// currentRole := c.Query("role")
	// currentSearch := c.Query("search")

	query := "SELECT id, first_name, email, created_at, role, status FROM users"

	// if currentRole != "" && currentSearch != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE role=%s
	// 	first_name LIKE "%%s%" OR email LIKE "%%s%"
	// `, currentRole, currentSearch, currentSearch)
	// } else if currentRole != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE role=%s
	// `, currentRole)
	// } else if currentSearch != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE
	// 	first_name LIKE "%%s%" OR email LIKE "%%s%"
	// `, currentSearch, currentSearch)
	// }

	var resultData []ResultUserAccount

	rows, err := db.Query(query)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	defer rows.Close()

	for rows.Next() {
		var data ResultUserAccount
		if err := rows.Scan(&data.ID, &data.FirstName, &data.Email, &data.CreatedAt, &data.Role, &data.Status); err != nil {
			fmt.Print("There's something error when bind result data!")
			continue
		}
		resultData = append(resultData, data)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully Fetch Accounts Data",
		"data":    resultData,
	})

}

func GetDetailAccount(c *gin.Context) {

	user_id := c.Param("id")

	if user_id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Invalid ID Request",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"status_code": http.StatusInternalServerError,
			"error":       err.Error(),
		})
		return
	}

	defer db.Close()

	query := fmt.Sprintf(`SELECT u.id as id_user, u.first_name, u.last_name, u.email, u.phone_country_code ,u.phone, u.role, u.status, u.verified, u.verified_at, u.created_at, u.updated_at,
		ui.id as id_user_image, ui.url as image_url, 
			uid.id as id_user_identification, uid.document_url as document_url, uid.reason, uid.status as identification_status,
				ua.id as id_user_addres, ua.address, ua.zip_code, ua.country, ua.city
	FROM users u 
		LEFT JOIN user_images ui 
			ON ui.id_user = u.id
				LEFT JOIN user_identification uid
					ON uid.id_user = u.id
						LEFT JOIN user_address ua
							ON ua.id_user = u.id
								WHERE u.id = %s`, user_id)

	var resultAccount models.ResultDetailAccount
	var resultAccountImage models.ResultUserImages
	var resultIdentificationAccount models.ResultUserIdentifaction
	var resultAddressAccount models.ResultUserAddress

	if err := db.QueryRow(query).Scan(
		// user

		&resultAccount.ID, &resultAccount.FirstName, &resultAccount.LastName, &resultAccount.Email, &resultAccount.PhoneCountryCode, &resultAccount.Phone, &resultAccount.Role, &resultAccount.Status, &resultAccount.Verified, &resultAccount.VerifiedAt, &resultAccount.CreatedAt, &resultAccount.UpdatedAt,

		// user_images

		&resultAccountImage.ID, &resultAccountImage.Url,

		// user_identifaction

		&resultIdentificationAccount.ID, &resultIdentificationAccount.DocumentURL, &resultIdentificationAccount.Reason, &resultIdentificationAccount.Status,

		// user_address

		&resultAddressAccount.ID, &resultAddressAccount.Address, &resultAddressAccount.ZipCode, &resultAddressAccount.Country, &resultAddressAccount.City,
	); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Cannot Found Account!",
				"status_code": http.StatusNotFound,
				"error":       err.Error(),
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Fetch Data",
				"status_code": http.StatusInternalServerError,
				"error":       err.Error(),
			})
		}
		return
	}

	type ResponseDetailAccount struct {
		User            models.ResultDetailAccount     `json:"user"`
		Image           models.ResultUserImages        `json:"image"`
		Identificaition models.ResultUserIdentifaction `json:"identification"`
		Address         models.ResultUserAddress       `json:"address"`
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Successfully Fetch Data...",
		"status_code": http.StatusOK,
		"data": &ResponseDetailAccount{
			resultAccount,
			resultAccountImage,
			resultIdentificationAccount,
			resultAddressAccount,
		},
	})

}

func CreateAccount(c *gin.Context) {

	var data RequestAccountData

	if err := c.ShouldBind(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Make Sure All Required Column Must Filled!",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	statusCreatedAccount := &ResponseStatusCreatedData{
		IsAccountCreated:         false,
		IsLocationAccountCreated: false,
		IsAccountProfileCreated:  false,
	}

	// buat password jika, dibuatnya disini
	if strings.ToLower(data.IsManualPassword) == "false" {
		randomWord, err := utils.CreateRandomToken()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "Failed Create Random Password!",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		data.Password = randomWord
	}

	hashedPassword, err := utils.CreateHashPassword(data.Password)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":        "There's Something Error When Hashing Password",
			"error":          err.Error(),
			"status_code":    http.StatusInternalServerError,
			"status_created": statusCreatedAccount,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":        "There's Something Error When Connecting Into Database",
			"error":          err.Error(),
			"status_code":    http.StatusInternalServerError,
			"status_created": statusCreatedAccount,
		})
		return
	}

	stmtInsert, err := db.Prepare(`INSERT INTO 
		users(first_name, last_name, email, phone_country_code, phone, password, role, status, created_at, updated_at)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":        "There's Something Error When Preparing Insert Account Data Into Database",
			"error":          err.Error(),
			"status_code":    http.StatusInternalServerError,
			"status_created": statusCreatedAccount,
		})
		return
	}

	defer stmtInsert.Close()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	res, err := stmtInsert.Exec(
		data.FirstName,
		data.LastName,
		data.Email,
		data.PhoneCountryCode,
		data.Phone,
		hashedPassword,
		data.Role,
		"active",
		currentTimeMili,
		currentTimeMili,
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
				"message":        "There's Something Error When Insert Account Data Into Database",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
		}
		return
	}

	statusCreatedAccount.IsAccountCreated = true

	user_id, err := res.LastInsertId()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":        "There's Something Error When Checking Id Use In Database!",
			"error":          err.Error(),
			"status_code":    http.StatusInternalServerError,
			"status_created": statusCreatedAccount,
		})
		return
	}

	if strings.ToLower(data.IsLocationIncluded) == "true" {
		stmtInsertLocation, err := db.Prepare(`INSERT INTO 
			user_address(id_user, address, country, city, zip_code, created_at,updated_at, created_by, updated_by)
			VALUES(? ,? ,?, ?, ?, ?, ?, ?, ?)
		`)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Prepare To Insert Personal Information Account!",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}

		defer stmtInsertLocation.Close()

		_, err = stmtInsertLocation.Exec(
			user_id,
			data.address,
			data.country,
			data.city,
			data.zip_code,
			currentTimeMili,
			currentTimeMili,
			user_id,
			user_id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Insert Personal Information Account!",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}
		statusCreatedAccount.IsLocationAccountCreated = true
	}

	if strings.ToLower(data.IsHasImage) == "true" {

		file, err := c.FormFile("avatar_image")

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message":        "We Didn't Receive Any Uploaded File!",
				"error":          err.Error(),
				"status_code":    http.StatusBadRequest,
				"status_created": statusCreatedAccount,
			})
			return
		}

		if !strings.HasPrefix(file.Header.Get("Content-Type"), "image/") {
			c.JSON(http.StatusBadRequest, gin.H{
				"message":        "Sorry We Cannot Process To Uploud Cause The Type Of Image!",
				"status_code":    http.StatusBadRequest,
				"status_created": statusCreatedAccount,
			})
			return
		}

		openedFile, err := file.Open()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Read The File",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}

		defer openedFile.Close()

		filename := fmt.Sprintf("user_id_%d/profile-user", user_id)
		response := storage.UploudProfileAvatar(openedFile, filename, file.Header.Get("Content-Type"))

		if !response.IsSuccess {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        response.Message,
				"error":          response.ErrorMessage,
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}

		stmtProfile, err := db.Prepare(`INSERT INTO user_images(id_user, url, created_at, updated_at, created_by, updated_by) 
			VALUES(?, ?, ?, ?, ?, ?)
		`)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Prepare To Insert Profile Avatar!",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}

		defer stmtProfile.Close()

		_, err = stmtProfile.Exec(
			user_id,
			response.URL,
			currentTimeMili,
			currentTimeMili,
			user_id,
			user_id,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Want To Insert Profile Images Into Database!",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_created": statusCreatedAccount,
			})
			return
		}
		statusCreatedAccount.IsAccountProfileCreated = true
	}

	message := fmt.Sprintf(`Hello, %s,
		Your Account Was Successfully been created!
		Your Account Was Active To!
		`, data.FirstName)

	if strings.ToLower(data.IsManualPassword) == "false" && strings.ToLower(data.IsSendPasswordToEmail) == "true" {
		message = fmt.Sprintf(`%s
		Here is Your Credentials
		Password:%s
		`, message, data.Password)
	}

	dataSendEmail := &models.SenderEmailNeeded{
		Subject: "Your Account Was Succesfully Created!",
		Message: message,
		To:      []string{data.Email},
		Cc:      []string{data.Email},
	}

	go sendemail.SendEmail(dataSendEmail)

	c.JSON(http.StatusCreated, gin.H{
		"message":        "Successfully Create Account",
		"status_code":    http.StatusCreated,
		"user_id":        user_id,
		"status_created": statusCreatedAccount,
	})

}

func DeleteAccount(c *gin.Context) {
	user_id := c.Param("id")

	if user_id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Invalid ID Request",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"status_code": http.StatusInternalServerError,
			"error":       err.Error(),
		})
		return
	}

	defer db.Close()

	stmt, err := db.Prepare(`UPDATE users SET status='deleted' where id=?`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Delete Account",
			"status_code": http.StatusInternalServerError,
			"error":       err.Error(),
		})
		return
	}

	defer stmt.Close()

	res, err := stmt.Exec(user_id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Delete Account",
			"status_code": http.StatusInternalServerError,
			"error":       err.Error(),
		})
		return
	}

	totalAffectedRows, err := res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Wan To Check If Account Was Deleted Or Not!",
			"status_code": http.StatusInternalServerError,
			"error":       err.Error(),
		})
		return
	}

	if totalAffectedRows == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry We Cannot Found The Account Or The Account Has Been Deleted!",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Your Account Was Succesfully Deleted!",
		"status_code": http.StatusOK,
	})

}

func UpdateAccount(c *gin.Context) {}
