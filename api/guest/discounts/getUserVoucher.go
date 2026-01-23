package guest_discount

import (
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

type ResultUserVoucher struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	ExpiredAt   int64  `json:"expired_at"`
}

func GetVoucherUser(c *gin.Context) {

	credentials := controller.CheckCredentialsAccount(c)

	if !credentials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry we cannot process...",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusNotFound,
		})
		return
	}

	defer db.Close()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	// untuk saat ini hanya menampilkan data yang vouchernya masih aktif dan tidak kadalurasa
	query := `SELECT uv.id, v.name, v.description, uv.expired_at FROM user_vouchers uv 
	INNER JOIN vouchers v ON v.id = uv.id_voucher
	WHERE uv.status = 'active' AND uv.id_user = ? AND uv.expired_at >= ?`

	rows, err := db.Query(query, credentials.User.ID, currentTimeMili)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "There's Something Error When Getting Voucher Data",
			"error":       err.Error(),
			"status_code": http.StatusNotFound,
		})
		return
	}

	vouchers := []ResultUserVoucher{}

	defer rows.Close()

	for rows.Next() {
		var voucher ResultUserVoucher

		if err = rows.Scan(&voucher.ID, &voucher.Name, &voucher.Description, &voucher.ExpiredAt); err != nil {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "There's Something Error When Scannig VOucher Data",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
			return
		}
		vouchers = append(vouchers, voucher)
	}

	if len(vouchers) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry we cannot found any vouchers...",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Vouchers!",
		"data":        vouchers,
		"status_code": http.StatusOK,
	})

}
