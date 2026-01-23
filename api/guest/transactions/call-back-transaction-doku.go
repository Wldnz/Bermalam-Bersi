package guest_transactions

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/lib"
	"bersi.bermalam.id/models"
	sendemail "bersi.bermalam.id/utils/sendEmail"
	"github.com/gin-gonic/gin"
)

// type ResponseCallBackDoku struct {
// 	Service struct {
// 		ID   string `json:"id"`
// 		Name string `json:"name"`
// 	} `json:"service"`

// 	Channel struct {
// 		ID   string `json:"id"`
// 		Name string `json:"name"`
// 	} `json:"channel"`

// 	Order struct {
// 		InvoiceNumber string  `json:"invoice_number"`
// 		Amount        float64 `json:"amount"`
// 	} `json:"order"`

// 	Transaction struct {
// 		Status string `json:"status"`
// 		Date   string `json:"date"`
// 	} `json:"transaction"`
// }

type ResponseCallBackDoku struct {
	Service struct {
		ID string `json:"id"`
	} `json:"service"`
	Channel struct {
		ID string `json:"id"`
	} `json:"channel"`
	Order struct {
		InvoiceNumber string  `json:"invoice_number"`
		Amount        float64 `json:"amount"` // float64 aman untuk 1803000
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
		fmt.Println("There's Something Error In:" + err.Error())
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

	// if err = c.ShouldBind(&data); err != nil {
	// fmt.Println("There's Something Error In:" + err.Error())
	// 	fmt.Println("ERROR bINDING : " + err.Error())
	// 	c.JSON(http.StatusBadRequest, gin.H{
	// 		"message":     "There's Something Error When Scanning Body",
	// 		"error":       err.Error(),
	// 		"status_code": http.StatusBadRequest,
	// 	})
	// 	return
	// }

	if err = json.Unmarshal(bodyBytes, &data); err != nil {
		fmt.Println("There's Something Error In:" + err.Error())
		fmt.Println("ERROR Unmarshal : " + err.Error())
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "There's Something Error When Unmarshal Body",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		fmt.Println("There's Something Error In:" + err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	// search the transaction

	var id_trasaction, id_user, total_rooms int
	var guest_name, guest_email, category_transaction, check_in_at, check_out_at string

	err = db.QueryRow(`SELECT t.id, t.id_user, u.first_name, u.email, t.total_rooms, t.category, t.check_in, t.check_out FROM transactions t
		INNER JOIN transaction_doku_informations idi ON idi.id_transaction = t.id
		INNER JOIN users u ON u.id = t.id_user
			WHERE idi.invoice_id=?`, data.Order.InvoiceNumber).Scan(&id_trasaction, &id_user, &guest_name, &guest_email, &total_rooms, &category_transaction, &check_in_at, &check_out_at)
	if err != nil {
		fmt.Println("There's Something Error In:" + err.Error())
		fmt.Println("Error When Search Transaction: " + err.Error())
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
		fmt.Println("There's Something Error In:" + err.Error())
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

		// check the available hotel rooms first
		type_room_ids := []int{}

		queryGettingTypeRooms := `SELECT id_type_room FROM booking WHERE id_transaction = ? GROUP BY id_type_room`

		rows, err := tx.Query(queryGettingTypeRooms, id_trasaction)

		if err != nil {
			fmt.Println("There's Something Error In:" + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Type Rooms",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		defer rows.Close()

		for rows.Next() {
			var id_type_room int

			if err = rows.Scan(&id_type_room); err != nil {
				fmt.Println("There's Something Error In:" + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Scanning Data Type Rooms",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			type_room_ids = append(type_room_ids, id_type_room)
		}

		if len(type_room_ids) == 0 {
			fmt.Println("Error When Search Type Room: " + err.Error())
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "Cannot Found Any Type Rooms",
				"error":       err.Error(),
				"status_code": http.StatusNotFound,
			})
			return
		}

		statusPayment := "paid"

		for _, type_room_id := range type_room_ids {

			query := `SELECT hr.id FROM hotel_rooms hr
					WHERE hr.id_type_room = ? AND STATUS='available' AND
					hr.id NOT IN (
					SELECT id_hotel_room FROM hotel_room_bookings
					WHERE NOT (check_out_at <=  ?  OR check_in_at >= ?)	
					)
					LIMIT ?`

			rows, err = tx.Query(query,
				type_room_id,
				check_in_at,
				check_out_at,
				total_rooms,
			)

			if err != nil {
				fmt.Println("There's Something Error In:" + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error When Getting Hotel Rooms",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			id_rooms := []int{}

			for rows.Next() {
				var id_room int
				if err = rows.Scan(&id_room); err != nil {
					fmt.Println("There's Something Error In:" + err.Error())
					c.JSON(http.StatusInternalServerError, gin.H{
						"message":     "There's Something Error When Scanning Data Hotel Rooms",
						"error":       err.Error(),
						"status_code": http.StatusInternalServerError,
					})
					return
				}
				id_rooms = append(id_rooms, id_room)
			}

			rows.Close()

			if len(id_rooms) == 0 || len(id_rooms) < total_rooms {
				// do something here......
				// cancell the order or what...
				// send notification via email that something happend........
				statusPayment = "request_refund" // refund trasnaction ya
				break
			} else {
				// create the hotel_rooms booking here...

				for _, id_room := range id_rooms {

					query = `INSERT INTO hotel_room_bookings(id_hotel_room, check_in_at, check_out_at, created_at, updated_at, created_by, updated_by)
					VALUES( ?, ?, ?, ?, ?, ?, ? )
				`
					_, err = tx.Exec(query,
						id_room,
						check_in_at,
						check_out_at,
						currentTimeMili,
						currentTimeMili,
						id_user,
						id_user,
					)

					if err != nil {
						fmt.Println("There's Something Error In:" + err.Error())
						c.JSON(http.StatusInternalServerError, gin.H{
							"message":     "There's Something Error When New Booked Room",
							"error":       err.Error(),
							"status_code": http.StatusInternalServerError,
						})
						return
					}

				}

			}
		}

		if statusPayment == "request_refund" {
			queryRefundTransaction := `INSERT INTO request_refund_transaction(id_transaction, status, reason, reason_hotel, reason_application, created_at, updated_at, created_by, updated_by)
				VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ? )`

			_, err = tx.Exec(queryRefundTransaction,
				id_trasaction,
				"accepted_application", // dua pihak sudah setuju
				"Hotel Doesnt Have Any Rooms Left To Fullfill your orders!",
				"-",
				"-",
				currentTimeMili,
				currentTimeMili,
				id_user,
				id_user,
			)

			if err != nil {
				fmt.Println("There's Something Error In:" + err.Error())
				c.JSON(http.StatusInternalServerError, gin.H{
					"message":     "There's Something Error Want To Creating Request Refund",
					"error":       err.Error(),
					"status_code": http.StatusInternalServerError,
				})
				return
			}

			go sendemail.SendEmail(&models.SenderEmailNeeded{
				Subject: "Your Transaction Was Succesfully, But The Hotels Doesnt Have Any Rooms Left To Cover Your Orders",
				Message: fmt.Sprintf(`Hello, %s
					Please Contact The Hotel To Refund Your Transaction, It's Happen Because The Hotels Doesnt Have Any Rooms Left To Cover Your Orders...
					Hotel Contact:
					Telephone Example: +62812919212 (Has WhastApp)
					Email: hotel@example.com`, guest_name),
				To: []string{guest_email},
				Cc: []string{guest_email},
			})
		}

		queryTransaction := `UPDATE transactions SET payment_type=?, status=?, updated_at=? WHERE id=?`

		res, err := tx.Exec(queryTransaction,
			data.Channel.ID,
			statusPayment,
			currentTimeMili,
			id_trasaction,
		)

		if err != nil {
			fmt.Println("There's Something Error In:" + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Updating Transaction....",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		totalAffectedRows, err := res.RowsAffected()

		if err != nil {
			fmt.Println("There's Something Error In:" + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error Getting TotalAffectedRows After Updating Transaction",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}

		if totalAffectedRows == 0 {
			fmt.Println("Error When Doesnt Rows Affected! ")
			c.JSON(http.StatusNotFound, gin.H{
				"message":     "There's No Rows Affected! After Updating Transaction",
				"status_code": http.StatusNotFound,
			})
			return
		}

		if err = tx.Commit(); err != nil {
			fmt.Println("There's Something Error In:" + err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Commiting DB Transaction",
				"status_code": http.StatusInternalServerError,
			})
			return
		}

	} else {
		db.Exec("UPDATE transactions SET status='fail', updated=? WHERE id=?", currentTimeMili, id_trasaction)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     fmt.Sprintf("Succesfully Updating Transaction From Doku Transaction With Status: %s", data.Transaction.Status),
		"status_code": http.StatusOK,
	})

	// update hotel_room // seperti belum perlu ini
	// update

}
