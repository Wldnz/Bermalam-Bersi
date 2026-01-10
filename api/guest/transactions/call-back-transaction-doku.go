package guest_transactions

import (
	"bytes"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/lib"
	"github.com/gin-gonic/gin"
)

type ResponseCallBackDoku struct {
	Service struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"service"`

	Channel struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"channel"`

	Order struct {
		InvoiceNumber string  `json:"invoice_number"`
		Amount        float64 `json:"amount"`
	} `json:"order"`

	Transaction struct {
		Status string `json:"status"`
		Date   string `json:"date"`
	} `json:"transaction"`
}

func CallBackTransactionDoku(c *gin.Context) {

	dokuSignature := c.Request.Header.Get("Signature")
	dokuTimeStamp := c.Request.Header.Get("Request-Timestamp")
	dokuRequestID := c.Request.Header.Get("Request-Id")
	clientID := os.Getenv("DOKU_CLIENT_ID")
	secretKey := os.Getenv("DOKU_ACTIVE_SECRET_KEY")

	bodyBytes, err := io.ReadAll(c.Request.Body)
	fmt.Println("call-back-got-hit")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Reading Body",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// katanya buat biar body bisa kebaca lagi
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	targetPath := "/transactions/callback"

	signature := lib.CreateDokuSignature(
		clientID,
		dokuRequestID,
		dokuTimeStamp,
		string(bodyBytes),
		targetPath,
		secretKey,
	)

	expectedSignature := "HMACSHA256=" + signature

	if dokuSignature != expectedSignature {
		fmt.Println("Ada yang nembak, namun gagal nich wkwkwk")
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry... You Cannot Request To This Message",
			"status_code": http.StatusForbidden,
		})
		return
	}

	// lannjutkan disini...

	var data ResponseCallBackDoku

	fmt.Println("Raw Data: " + string(bodyBytes))

	if err = c.ShouldBind(&data); err != nil {
		fmt.Println("ERROR bINDING : " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "There's Something Error When Scanning Body",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	defer db.Close()

	// search the transaction

	var id_trasaction int
	var category_transaction string

	err = db.QueryRow(`SELECT t.id, t.category FROM transactions t
		INNER JOIN transaction_doku_informations idi ON idi.id_transaction = t.id
			WHERE idi.invoice_id=?`, data.Order.InvoiceNumber).Scan(&id_trasaction, &category_transaction)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Cannot Found The Transaction....",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Current Transaction",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	// update transaction

	tx, err := db.Begin()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Begin The Transaction Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer tx.Rollback()

	// right now just probabbly only succesfully payment!

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	if data.Transaction.Status == "SUCCESS" {
		queryTransaction := `UPDATE transactions SET payment_type=?, status='paid', updated_at=? WHERE id=?`

		res, err := tx.Exec(queryTransaction,
			data.Channel.ID,
			currentTimeMili,
			id_trasaction,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Updating Transaction....",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		totalAffectedRows, err := res.RowsAffected()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error Getting TotalAffectedRows After Updating Transaction",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		if totalAffectedRows == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "There's No Rows Affected! After Updating Transaction",
				"status_code": http.StatusNotFound,
			})
			return
		}

		// sementara update dlu untuk melihat apakah berhasil atau tidaknya...

		type_room_ids := []int{}

		queryGettingTypeRooms := `SELECT id_type_room FROM booking WHERE id_transaction = ?`

		rows, err := tx.Query(queryGettingTypeRooms, id_trasaction)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Type Rooms",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		defer rows.Close()

		for rows.Next() {
			var id_booking int

			if err = rows.Scan(&id_booking); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Scanning Data Type Rooms",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			type_room_ids = append(type_room_ids, id_booking)
		}

		if len(type_room_ids) == 0 {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Cannot Found Any Type Rooms",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
			return
		}

		for _, type_room_id := range type_room_ids {
			queryBookTheRooms := `UPDATE hotel_rooms SET status='not_available', updated_at=? WHERE id_type_room=? AND status='available' LIMIT 1`

			res, err = tx.Exec(queryBookTheRooms,
				currentTimeMili,
				type_room_id,
			)

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Updating status hotel room....",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			totalAffectedRows, err = res.RowsAffected()

			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error Getting TotalAffectedRows After Updating Status Hotel Rooms",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			if totalAffectedRows == 0 {
				c.JSON(http.StatusNotFound, gin.H{
					"message":     "There's No Rows Affected! After Updating Status Room",
					"status_code": http.StatusNotFound,
				})
				return
			}
		}

		if err = tx.Commit(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Commiting DB Transaction",
				"status_code": http.StatusInternalServerError,
			})
			return
		}

	}

	c.JSON(http.StatusOK, gin.H{
		"message":     fmt.Sprintf("Succesfully Updating Transaction From Doku Transaction With Status: %s", data.Transaction.Status),
		"status_code": http.StatusOK,
	})

	// update hotel_room // seperti belum perlu ini
	// update

}
