package guest_discount

import (
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

func GetUsedVouchers(c *gin.Context) {

	category := c.DefaultQuery("category", "discount")

	credentials := controller.CheckCredentialsAccount(c)

	if !credentials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry, we cannot process...",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Errror When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()
	query := `SELECT id, name, description, category, poin_exchange FROM vouchers
				WHERE stock > 0 AND expired_at > ? AND category=? AND id IN (
					SELECT uv.id FROM transaction_vouchers ts
						LEFT JOIN user_vouchers uv ON uv.id = ts.id_user_voucher
						LEFT JOIN vouchers v ON v.id = uv.id_voucher
						WHERE uv.id_user = ?
				)`

	rows, err := db.Query(query, currentTimeMili, category, credentials.User.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting Available Vouchers",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer rows.Close()

	vouchers := []ResultDiscount{}

	for rows.Next() {
		var voucher ResultDiscount
		if err = rows.Scan(&voucher.ID, &voucher.Name, &voucher.Description, &voucher.Category, &voucher.PoinExchange); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Scanning Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		vouchers = append(vouchers, voucher)
	}

	if len(vouchers) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry.. We Cannot Found Any Available Vouchers...",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Available Vouchers!",
		"data":        vouchers,
		"status_code": http.StatusOK,
	})

}
