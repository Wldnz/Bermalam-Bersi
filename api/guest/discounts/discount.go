package guest_discount

import (
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultDiscount struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	PoinExchange int    `json:"poin_exchange"`
	Category     string `json:"category"`
}

func GetDiscounts(c *gin.Context) {

	category := c.DefaultQuery("category", "discount")

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
				WHERE stock > 0 AND expired_at > ? AND category=?`

	rows, err := db.Query(query, currentTimeMili, category)

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
