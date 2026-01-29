package guest_profile

import (
	"database/sql"
	"net/http"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

type ResultProfileUser struct {
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	Email            string `json:"email"`
	PhoneCountryCode string `json:"phone_country_code"`
	Phone            string `json:"phone"`
	ImageURL         string `json:"image_url"`
}

type ResultProfileAddressUser struct {
	ID           int    `json:"id"`
	Address      string `json:"address"`
	Country      string `json:"country"`
	City         string `json:"city"`
	ZipCode      int    `json:"zip_code"`
	CreatedAt    int64  `json:"created_at"`
	UpdatedAt    int64  `json:"upadated_at"`
	IsHasAddress bool   `json:"is_has_address"`
}

type ResponseData struct {
	User    ResultProfileUser        `json:"user"`
	Address ResultProfileAddressUser `json:"address"`

	TotalTransactions int `json:"total_transactions"`
}

func GetProfiles(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry we cannot process",
			"status_code": http.StatusUnauthorized,
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

	query := `SELECT u.first_name, u.last_name, u.email, u.phone_country_code, u.phone, COALESCE(um.url, "") AS image_url FROM users u
				LEFT JOIN user_images um ON um.id_user = u.id
				WHERE u.id = ?;`

	// var ResponseData ResponseData

	var profileUser ResultProfileUser

	if err = db.QueryRow(query, credential.User.ID).Scan(
		&profileUser.FirstName,
		&profileUser.LastName,
		&profileUser.Email,
		&profileUser.PhoneCountryCode,
		&profileUser.Phone,
		&profileUser.ImageURL,
	); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Scanning Profile Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		} else {

			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Scanning Profile Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	query = `SELECT 
				id, address, country, city, zip_code, created_at, updated_at
			FROM user_address WHERE id_user = ?`

	var profileAddress ResultProfileAddressUser

	if err = db.QueryRow(query, credential.User.ID).Scan(
		&profileAddress.ID, &profileAddress.Address, &profileAddress.Country, &profileAddress.City, &profileAddress.ZipCode, &profileAddress.CreatedAt, &profileAddress.UpdatedAt,
	); err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "There's Something Error When Scanning Profile Address!",
		})
		return
	}

	if profileAddress.ID != 0 {
		profileAddress.IsHasAddress = true
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Succesfully Getting Information Profile",
		"data": &ResponseData{
			User:    profileUser,
			Address: profileAddress,
		},
		"status_code": http.StatusOK,
	})
}
