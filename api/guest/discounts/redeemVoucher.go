package guest_discount

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

type ResultCheckingVoucher struct {
	Name         string
	PoinExchange int64
	Stock        int64
	ExpiredAt    int64
}

func RedeemVoucher(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	idVoucher := c.Param("id")

	if idVoucher == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Please bring the id",
		})
		return
	}

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry... We Cannot Proces",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	tx, err := db.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want Begin The Redeem",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer tx.Rollback()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	// syarat redeem point apa saja?
	// 1. check apakah dia pernah menggunakan kuponnya sama atau lebih dari max_penukaran?
	// 2. check pointnya apakah cukup?
	// 3. redeem deh
	// check apakah voucher masih tersedia
	query := `SELECT name, poin_exchange, stock, expired_at FROM vouchers 
				WHERE max_exchange > (SELECT COUNT(id) FROM user_vouchers 
			WHERE id_voucher =? AND id_user =?)
			AND id = ?;`

	var resultCheckingVoucher ResultCheckingVoucher

	if err = tx.QueryRow(query, idVoucher, credential.User.ID, idVoucher).Scan(&resultCheckingVoucher.Name, &resultCheckingVoucher.PoinExchange, &resultCheckingVoucher.Stock, &resultCheckingVoucher.ExpiredAt); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Sorry We Cannot Found The Voucher Or You Have Redeem It Before!",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Checking The Voucher Who Want To Reedem!",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	if currentTimeMili > resultCheckingVoucher.ExpiredAt {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "The Voucher Already Expired",
			"status_code": http.StatusForbidden,
		})
		return
	}

	if resultCheckingVoucher.Stock <= 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Voucher Out Of Stock!",
			"status_code": http.StatusForbidden,
		})
		return
	}

	// blm ada check point...

	var currenPointUser int64

	query = `SELECT points FROM users WHERE id =?`

	if err = tx.QueryRow(query, credential.User.ID).Scan(&currenPointUser); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Sorry We Cannot The User",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Checking User Points",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	if currenPointUser < resultCheckingVoucher.PoinExchange {
		c.JSON(http.StatusForbidden, gin.H{
			"message":       "Oops... Your Points Is Not Enough To Convert Into This Voucher",
			"currentPoints": currenPointUser,
			"poin_needed":   resultCheckingVoucher.PoinExchange,
			"status_code":   http.StatusForbidden,
		})
		return
	}

	query = `INSERT INTO user_vouchers ( id_voucher, id_user, expired_at, created_at, updated_at, created_by, updated_by )
		VALUES( ?, ?, ?, ?, ?, ?, ? )
	`

	res, err := tx.Exec(query,
		idVoucher,
		credential.User.ID,
		currentTimeMili+(60*60*24*7*1000), // jujur ini gak tau masih berapa untuk expirednya wkwk, 7 hari aja lah
		currentTimeMili,
		currentTimeMili,
		credential.User.ID,
		credential.User.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Store The Voucher Into Database!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	totalAffectedRows, err := res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Getting Rows Affected On Storing Voucher!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if totalAffectedRows == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "Sorry, We Cannot Store The Voucher!",
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// kurangin poin si user

	currentPoints := currenPointUser - resultCheckingVoucher.PoinExchange + 1 // ini biar rows affectednya nyala wkwkwk

	query = `UPDATE users SET points=? WHERE id=?`

	res, err = tx.Exec(query,
		currentPoints,
		credential.User.ID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Update The Current Points!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	totalAffectedRows, err = res.RowsAffected()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Check The Updated Current Points!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if totalAffectedRows == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "Sorry We Cannot Update The Current Points!",
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Saving All Changes!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     fmt.Sprintf("Successfully Convert Point Into Voucher: '%s' ", resultCheckingVoucher.Name),
		"status_code": http.StatusCreated,
	})
}
