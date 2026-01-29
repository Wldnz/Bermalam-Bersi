package guest_discount

import (
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

func GetActiveOrInactiveVouchers(c *gin.Context) {

	status := c.Query("status")

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry, We cannot process...",
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

	additionalParam := ""

	if status != "" {
		additionalParam += fmt.Sprintf(" AND uv.status='%s'", status)
	}

	query := fmt.Sprintf(`SELECT v.id, v.name, v.description, v.category, v.poin_exchange, v.uv.status FROM vouchers v
				WHERE stock > 0 AND expired_at > ? AND (category='discount' OR category='cashback')
				JOIN user_vouchers uv ON uv.id = v.id 
				WHERE uv.id_user=? AND %s
				`, additionalParam)

	rows, err := db.Query(query, currentTimeMili, credential.User.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting Active Or Active Vouchers",
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
			"message":     "Sorry.. We Cannot Found Any Active Or Active Vouchers...",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Active Or Active Vouchers!",
		"data":        vouchers,
		"status_code": http.StatusOK,
	})

}
