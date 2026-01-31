package guest_transactions

import (
	"database/sql"
	"net/http"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

func CancelTheTransaction(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry, we cannot process...",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	idTransaction := c.Param("id")

	if idTransaction == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "please bring the id!",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database!",
			"error":       err.Error(),
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	defer db.Close()

	// kebijakan layanan bermalam
	// ketika transaksi di pesan, hotel bisa memberikan, berapa lama waktu yang diberikan untuk tamu membatalkan transaksi? 2 jam kah atau 10 jam
	// nah dari waktu itu, kita validasi apakah waktu ini masih berlaku? kalo iya batalkan dan refund dia!
	// batalkan transaksi itu harus ngapain aja?
	// ets... sebelum itu kita check ambil terlebih dahulu untuk data transaction yaaa
	// pertama kita ubah status voucher yang digunakan menjadi active kembali
	// kedua kita ubah juga untuk hotel_room_booking statusnya menjadi cancelled ya!
	// ketiga kita ubah transaksi menjadi cancelled dan pastikan juga transaksinya ini harus pending / paid
	// keempat ketika refund dia melalui doku yaw jika statusnya paid!

	tx, err := db.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Want To Start Cancel The Transaction!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer tx.Rollback()

	query := `SELECT check_in, check_out, status FROM transactions WHERE id=? AND id_user=? AND (status = 'paid' or status = 'pending')`

	var checkIn, checkOut int64
	var statusTransaction string

	if err = tx.QueryRow(query, idTransaction, credential.User.ID).Scan(&checkIn, &checkOut, &statusTransaction); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Sorry... We cannot found the transaction data",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Transaction Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	// sebenarnya kita bisa check terlebih dahulu, apakah dia memiliki voucher atau tidak ya, atau bisa banget kayak gini, tapi minesnya kita gak kalo dia ini ada voucher atau tidak, bisa si dari totalAffectedrowsnya wkwkw

	query = `UPDATE user_vouchers SET status='active' WHERE id IN (
		SELECT id_user_voucher FROM transaction_vouchers WHERE id_transaction=?
	)`

	_, err = tx.Exec(query, idTransaction)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Updating Status Voucher Into Active Again (if had)",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if statusTransaction == "paid" {
		query = `UPDATE hotel_room_bookings SET status='cancelled'
			WHERE check_in_at = ? AND check_out_at = ? AND created_by=?`

		res, err := tx.Exec(query, checkIn, checkOut, credential.User.ID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Updating The Booked Room Status",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		// ini perlu gak ya wkwkw, bingung gw

		totalAffectedRows, err := res.RowsAffected()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Total Affected Rows!",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		if totalAffectedRows == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Sorry we cannot found any booked room!",
				"status_code": http.StatusNotFound,
			})
			return
		}
	}

	query = `UPDATE transactions SET status='cancelled'
		WHERE id=? AND id_user=?`

	// ini gak perlu res, karena diatas sudah ada validasi apakah ada transaksi dan status antara paid or pending
	_, err = tx.Exec(query, idTransaction, credential.User.ID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There Something Error When Updating Transaction Status",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	if statusTransaction == "paid" {
		// disini harus refund dia, tapi sementara uangnnya gak kita kembaliin wkwkwk
		// uang uang siapa? uang gweh wkwkkw
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There Something Error Save All Changes!",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Cancel The Transaction!",
		"status_code": http.StatusOK,
	})

}
