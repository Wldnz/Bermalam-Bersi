package guest_profile

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"bersi.bermalam.id/utils/storage"
	"github.com/gin-gonic/gin"
)

type PreviousLinkAvatarImage struct {
	ID  int
	URL string
}

type RequestUpdateAccountData struct {
	IsGeneralInformationUpdate string `form:"is_general_information_update" binding:"required"`

	FirstName        string `form:"first_name"`
	LastName         string `form:"last_name"`
	PhoneCountryCode string `form:"phone_country_code"`
	Phone            string `form:"phone"`

	IsLocationUpdate string `form:"is_location_update" binding:"required"`
	Address          string `form:"address"`
	Zip_code         string `form:"zip_code"`
	Country          string `form:"country"`
	City             string `form:"city"`

	IsImageUpdate string `form:"is_image_update" binding:"required"`
}

type ResponseStatusUpdatedData struct {
	IsGeneralUpdated  bool `json:"is_general_updated"`
	IsLocationUpdated bool `json:"is_location_account_updated"`
	IsAvatarUpdated   bool `json:"is_avatar_updated"`
}

func UpdateAccount(c *gin.Context) {

	// update Account?
	// only image?
	// general information?
	// only location?

	// ketika pengguna mengganti emailnya gimana?, apakah verifiednya menjadi 0? atau gimana, kita lihat nnti yah

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry.. We Cannot Process",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	var RequestData RequestUpdateAccountData

	if err := c.ShouldBind(&RequestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Please Fill The Required Column",
			"status_code": http.StatusBadRequest,
			"error":       err.Error(),
		})
		return
	}

	if strings.ToLower(RequestData.IsGeneralInformationUpdate) == "false" && strings.ToLower(RequestData.IsLocationUpdate) == "false" && strings.ToLower(RequestData.IsImageUpdate) == "false" {
		c.JSON(http.StatusOK, gin.H{
			"message":     "There's Nothing To Changed :D",
			"status_code": http.StatusOK,
		})
		return
	}

	if isUserExist := checkIsUserExist(credential.User.ID); !isUserExist {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry We Cannot Found The Account Or Something Error",
			"status_code": http.StatusNotFound,
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

	statusUpdated := &ResponseStatusUpdatedData{
		IsGeneralUpdated:  false,
		IsAvatarUpdated:   false,
		IsLocationUpdated: false,
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	if strings.ToLower(RequestData.IsGeneralInformationUpdate) == "true" {

		stmtGeneral, err := db.Prepare(`UPDATE users
			SET first_name=?, last_name=?, phone_country_code=?, phone=?, updated_at=?
				WHERE id=?
		`)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Prepare Into Database",
				"status_code":    http.StatusInternalServerError,
				"error":          err.Error(),
				"status_updated": statusUpdated,
			})
			return
		}

		defer stmtGeneral.Close()

		res, err := stmtGeneral.Exec(
			RequestData.FirstName,
			RequestData.LastName,
			RequestData.PhoneCountryCode,
			RequestData.Phone,
			currentTimeMili,
			credential.User.ID,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Updating Personal Data Into Database",
				"status_code":    http.StatusInternalServerError,
				"error":          err.Error(),
				"status_updated": statusUpdated,
			})
			return
		}

		totalAffectedRows, err := res.RowsAffected()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Want To Checking Rows Affected On Updating Personal Data",
				"status_code":    http.StatusInternalServerError,
				"error":          err.Error(),
				"status_updated": statusUpdated,
			})
			return
		}

		if totalAffectedRows == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"message":        "Cannot Updating Personal Data, Cause Cannot Found Account",
				"status_code":    http.StatusNotFound,
				"status_updated": statusUpdated,
			})
			return
		}

		statusUpdated.IsGeneralUpdated = true
	}

	if strings.ToLower(RequestData.IsImageUpdate) == "true" {

		file, err := c.FormFile("avatar_image")

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"message":        "We Didn't Receive Any Uploaded File!",
				"error":          err.Error(),
				"status_code":    http.StatusBadRequest,
				"status_updated": statusUpdated,
			})
			return
		}

		if !strings.HasPrefix(file.Header.Get("Content-Type"), "image/") {
			c.JSON(http.StatusBadRequest, gin.H{
				"message":        "Sorry We Cannot Process To Uploud Cause The Type Of Image!",
				"status_code":    http.StatusBadRequest,
				"status_updated": statusUpdated,
			})
			return
		}

		openedFile, err := file.Open()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        "There's Something Error When Read The File",
				"error":          err.Error(),
				"status_code":    http.StatusInternalServerError,
				"status_updated": statusUpdated,
			})
			return
		}

		defer openedFile.Close()

		var resultPreviousLinkAvatar PreviousLinkAvatarImage
		hasAvatarImage := true

		if err := db.QueryRow(`SELECT id, url FROM user_images WHERE id_user=?`, credential.User.ID).Scan(&resultPreviousLinkAvatar.ID, &resultPreviousLinkAvatar.URL); err != nil {
			if err == sql.ErrNoRows {
				hasAvatarImage = false
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Getting Old Avatar Image",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}
		}

		filename := fmt.Sprintf("user_id_%d/profile_user_%d", credential.User.ID, currentTimeMili)
		response := storage.UploudProfileAvatar(openedFile, filename, file.Header.Get("Content-Type"))

		if !response.IsSuccess {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":        response.Message,
				"error":          response.ErrorMessage,
				"status_code":    http.StatusInternalServerError,
				"status_updated": statusUpdated,
			})
			return
		}

		if hasAvatarImage {

			// masih kurang updated_by (blm ada middleware cik wkwkwk)
			stmtProfile, err := db.Prepare(`UPDATE user_images
				SET url=?, updated_at=?
					WHERE id=?
			`)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Prepare To Updating Profile Avatar!",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}

			defer stmtProfile.Close()

			res, err := stmtProfile.Exec(
				response.URL,
				currentTimeMili,
				resultPreviousLinkAvatar.ID,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Want To Updating Profile Images Into Database!",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}

			totalAffectedRows, err := res.RowsAffected()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Want To Check The If The Image Was Changed Or Not!",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}

			if totalAffectedRows > 0 {
				bucketName := os.Getenv("GOOGLE_BUCKET_NAME")
				splitterString := fmt.Sprintf("https://storage.googleapis.com/%s/", bucketName)
				oldFileName := strings.Split(resultPreviousLinkAvatar.URL, splitterString)[1]
				go func() {
					respDeleteFile := storage.DeleteProfileAvatar(oldFileName)
					fmt.Println(respDeleteFile)
				}()
				statusUpdated.IsAvatarUpdated = true
			}

		} else {
			stmtProfile, err := db.Prepare(`INSERT INTO user_images(id_user, url, created_at, updated_at, created_by, updated_by) 
			VALUES(?, ?, ?, ?, ?, ?)
		`)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Prepare To Insert Profile Avatar!",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}

			defer stmtProfile.Close()

			_, err = stmtProfile.Exec(
				credential.User.ID,
				response.URL,
				currentTimeMili,
				currentTimeMili,
				credential.User.ID,
				credential.User.ID,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Want To Insert Profile Images Into Database!",
					"error":          err.Error(),
					"status_code":    http.StatusInternalServerError,
					"status_updated": statusUpdated,
				})
				return
			}
			statusUpdated.IsAvatarUpdated = true
		}
	}

	if strings.ToLower(RequestData.IsLocationUpdate) == "true" {

		isHasLocation := true

		query := `SELECT id FROM user_address WHERE id=?`

		if err = db.QueryRow(query, credential.User.ID).Scan(); err != nil {
			if err == sql.ErrNoRows {
				isHasLocation = false
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Getting user locations",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}
		}

		if isHasLocation {
			stmtGeneral, err := db.Prepare(`UPDATE user_address
			SET address=?, zip_code=?, country=?, city=?, updated_at=?
				WHERE id_user=?
		`)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Prepare To Update The location of user Into Database",
					"status_code":    http.StatusInternalServerError,
					"error":          err.Error(),
					"status_updated": statusUpdated,
				})
				return
			}

			defer stmtGeneral.Close()

			res, err := stmtGeneral.Exec(
				RequestData.Address,
				RequestData.Zip_code,
				RequestData.Country,
				RequestData.City,
				currentTimeMili,
				credential.User.ID,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Updating Location Data Into Database",
					"status_code":    http.StatusInternalServerError,
					"error":          err.Error(),
					"status_updated": statusUpdated,
				})
				return
			}

			totalAffectedRows, err := res.RowsAffected()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":        "There's Something Error When Want To Checking Rows Affected On Updating Location Data",
					"status_code":    http.StatusInternalServerError,
					"error":          err.Error(),
					"status_updated": statusUpdated,
				})
				return
			}

			if totalAffectedRows == 0 {
				c.JSON(http.StatusNotFound, gin.H{
					"message":        "Cannot Updating Location Data, Cause Cannot Found Account",
					"status_code":    http.StatusNotFound,
					"status_updated": statusUpdated,
				})
				return
			}
		} else {
			query = `INSERT INTO user_address( id_user, address, country, city, zip_code, created_at, updated_at, created_by, updated_by ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`

			_, err := db.Exec(query,
				credential.User.ID,
				RequestData.Address,
				RequestData.Country,
				RequestData.City,
				RequestData.Zip_code,
				currentTimeMili,
				currentTimeMili,
				credential.User.ID,
				credential.User.ID,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Store Address",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}
		}

		statusUpdated.IsLocationUpdated = true

	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Succesfully Updating Account!",
		"status_code":    http.StatusOK,
		"status_updated": statusUpdated,
	})

}

func checkIsUserExist(user_id int) bool {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return false
	}

	defer db.Close()

	var name string

	if err := db.QueryRow(`SELECT first_name from users WHERE id=?`, user_id).Scan(&name); err != nil {
		return false
	}

	return true

}
