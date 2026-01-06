package admin

import (
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultStatisticDataAdmin struct {
	Mitras       int     `json:"total_mitras"`
	Guests       int     `json:"total_guests"`
	Hotels       int     `json:"total_hotels"`
	Orders       int     `json:"total_orders"`
	Pending      int     `json:"total_pending_orders"`
	Paid         int     `json:"total_paid_orders"`
	Success      int     `json:"total_success_orders"`
	Refund       int     `json:"total_refund_orders"`
	Cancelled    int     `json:"total_cancelled_orders"`
	TotalRevenue float64 `json:"total_revenue"`
}

func Dashboard(c *gin.Context) {

	db, err := config.ConnectToDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()

	// all time, month, 6 month, a year, 2 year

	currentTimeSelected := handleSelectedTime(c.Query("currentTime"))

	query := fmt.Sprintf(`
        SELECT 
            (SELECT COUNT(id) FROM users WHERE role='hotel_owner' AND created_at >=%d) as total_mitras,
            (SELECT COUNT(id) FROM users WHERE role='guest' AND created_at >=%d) as total_guests,
            (SELECT COUNT(id) FROM hotels WHERE created_at >= %d) as total_hotels,
            (SELECT COUNT(id) FROM transactions WHERE created_at >= %d) as total_orders,
            (SELECT COUNT(id) FROM transactions WHERE status='pending' AND created_at >= %d) as total_pending_orders,
            (SELECT COUNT(id) FROM transactions WHERE status='paid' AND created_at >= %d) as total_paid_orders,
            (SELECT COUNT(id) FROM transactions WHERE status='success' AND created_at >=%d) as total_success_orders,
            (SELECT COUNT(id) FROM transactions WHERE status='request_refund' AND created_at >=%d) as total_refund_orders,
            (SELECT COUNT(id) FROM transactions WHERE status='cancelled' AND created_at >=%d) as total_fail_orders,
            (SELECT COALESCE(SUM(total_price), 0) FROM transactions WHERE created_at >=%d) as total_revenue
    `, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected, currentTimeSelected)

	// Gunakan QueryRow karena kita hanya mengharapkan satu baris hasil

	var result ResultStatisticDataAdmin

	err = db.QueryRow(query).Scan(
		&result.Mitras, &result.Guests, &result.Hotels,
		&result.Orders, &result.Pending, &result.Paid,
		&result.Success, &result.Refund, &result.Cancelled,
		&result.TotalRevenue,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data Dashboard Berhasil Diambil",
		"data":    result,
	})
}

func handleSelectedTime(selectedTime string) int64 {
	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	defaultTime := int64(60 * 60 * 24 * 30 * 10000)

	switch selectedTime {
	case "all_time":
		return 0
	case "month":
		return currentTimeMili - (defaultTime)
	case "six_month":
		return currentTimeMili - (defaultTime * 6)
	case "year":
		return currentTimeMili - (defaultTime * 12)
	case "two_years":
		return currentTimeMili - (defaultTime * 24)
	default:
		// default adalah sebulan
		return currentTimeMili - (defaultTime)
	}
}
