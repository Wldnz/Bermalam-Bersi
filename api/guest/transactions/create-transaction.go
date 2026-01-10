package guest_transactions

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"bersi.bermalam.id/controller"
	"bersi.bermalam.id/lib"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/joho/godotenv/autoload"
)

// type GuestInformationData struct {
// 	FullName         string `json:"full_name"`
// 	PhoneCountryCode string `json:"phone_country_code"`
// 	Phone            string `json:"phone"`
// 	HasWhastApp      bool   `json:"hasWhastApp"`
// 	Note             string `json:"note"`
// }

// type RequestRoomBookingData struct {
// 	ID       int                    `json:"id_type_room"`
// 	Name     string                 `json:"name"`
// 	Quantity int                    `json:"quantity"`
// 	Guests   []GuestInformationData `json:"guests"`
// }

type VoucherUsedTransaction struct {
	ID   int    `json:"id_user_voucher"`
	Name string `json:"name"`
}

type RequestTransactionData struct {
	FullName         string                              `json:"full_name"`
	Email            string                              `json:"email"`
	PhoneCountryCode string                              `json:"phone_country_code"`
	Phone            string                              `json:"phone"`
	TotalRooms       int                                 `json:"total_rooms"`
	CheckInAt        int                                 `json:"check_in_at"`
	CheckOutAt       int                                 `json:"check_out_at"`
	Adults           int                                 `json:"adults"`
	Children         int                                 `json:"childrens"`
	Rooms            []controller.RequestRoomBookingData `json:"rooms"`

	Voucher         VoucherUsedTransaction `json:"voucher"`
	CategoryBooking string                 `json:"category_booking"`
	Simulation      bool                   `json:"simulation"`
	Currency        string                 `json:"currency"`
	Language        string                 `json:"language"`
}

// type LineItems struct {
// 	ID       string `json:"id"`
// 	Name     string `json:"name"`
// 	Quantity string `json:"quantity"`
// 	Price    int    `json:"price"`
// 	Category string `json:"category"`
// 	URL      string `json:"url"`
// 	ImageURL string `json:"image_url"`
// 	Type     string `json:"type"`
// }

type DokuResponse struct {
	Message  []string `json:"message"`
	Response struct {
		Payment struct {
			URL string `json:"url"` // Ini adalah field yang berisi link pembayaran
		} `json:"payment"`
	} `json:"response"`
}

type DataTransactions struct {
	TotalPrice       int
	TaxCost          int
	TotalRooms       int
	LevelTransaction string // (night, two_night, long_stay)
}

func CreateTransaction(c *gin.Context) {
	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	credentials := controller.CheckCredentialsAccount(c)

	if !credentials.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Please Login First To Create Booking Hotel!",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	var data RequestTransactionData

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "The Requirement Data Must Be Filled!",
			"error":       err.Error(),
			"status_code": http.StatusBadRequest,
		})
		return
	}

	var transaction DataTransactions

	// dapatkan level pengguna
	// 1 day
	minimumBookDayMili := (60 * 60 * 24 * 1000)
	whatLevelIsIt := data.CheckOutAt - data.CheckInAt

	if whatLevelIsIt >= minimumBookDayMili*7 {
		transaction.LevelTransaction = "long_stay"
	} else if whatLevelIsIt >= minimumBookDayMili*2 {
		transaction.LevelTransaction = "two_night"
	} else if whatLevelIsIt >= minimumBookDayMili {
		transaction.LevelTransaction = "night"
	} else {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry, You Must Book At Least 1 Day",
			"status_code": http.StatusForbidden,
		})
		return
	}

	// loop untuk mendapatkan totalHarga
	totalPriceResponse := controller.GetTotalPriceRoom(data.Rooms, transaction.LevelTransaction)

	if !totalPriceResponse.IsSuccess {
		if totalPriceResponse.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     totalPriceResponse.Message,
				"error":       totalPriceResponse.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     totalPriceResponse.Message,
				"error":       totalPriceResponse.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	// mendapatkan totalDiscount

	totalDiscountResponse := controller.GetTotalDiscountPrice(totalPriceResponse.TotalPrice, credentials.User.ID, data.Voucher.ID)

	if !totalDiscountResponse.IsSuccess {
		if totalDiscountResponse.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     totalDiscountResponse.Message,
				"error":       totalDiscountResponse.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     totalDiscountResponse.Message,
				"error":       totalDiscountResponse.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	transaction.TotalPrice = totalPriceResponse.TotalPrice - totalDiscountResponse.TotalDiscountPrice

	invoiceNumber := fmt.Sprintf("BOOK-%d", currentTimeMili)

	// sementara seperti ini dlu.... (deadline mepet... wkwkwk)
	paylodMaps := map[string]interface{}{
		"order": map[string]interface{}{
			"invoice_number": invoiceNumber,
			"amount":         transaction.TotalPrice + 3000,
			"currency":       data.Currency,
			"language":       data.Language,
			// "callback_url": "http://merchantcallbackurl.domain/",
			// "callback_url_cancel": "https://merchantcallbackurl-cancel.domain",
			// "callback_url_result": "https://merchantcallbackurl-cancel.domain",
			"auto_redirect": true,
		},
		"payment": map[string]interface{}{
			"payment_due_date": 60 * 12,
			// "payment_method_types": []string{
			// 	"QRIS",
			// },
		},
		// "line-items": []interface{}{},
		"customer": map[string]interface{}{
			"id":         credentials.User.ID,
			"first_name": credentials.User.FirstName,
			"email":      data.Email,
			"phone":      data.PhoneCountryCode + data.Phone,
		},
	}

	payloadBytes, err := json.Marshal(paylodMaps)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Convert Paylod Into Bytes",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	paymentLink, err := createPaymentLink(payloadBytes)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Creating Payment Link",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	respCreateTransaction := controller.CreateTransaction(
		credentials.User.ID,
		transaction.TotalPrice,
		data.TotalRooms,
		data.Adults,
		data.Children,
		data.CheckInAt,
		data.CheckOutAt,
		data.CategoryBooking,
		transaction.LevelTransaction,
		paymentLink,
		data.Voucher.ID,
		totalDiscountResponse.TotalDiscountPrice,
		invoiceNumber,
		totalPriceResponse.PriceRooms,
	)

	if !respCreateTransaction.IsSuccess {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     respCreateTransaction.Message,
			"error":       respCreateTransaction.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Create Transaction",
		"data":        paymentLink,
		"status_code": http.StatusOK,
	})

}

func createPaymentLink(payload []byte) (string, error) {
	client_id := os.Getenv("DOKU_CLIENT_ID")
	secret_key := os.Getenv("DOKU_ACTIVE_SECRET_KEY")
	api_url_doku := os.Getenv("DOKU_API_URL_SANDBOX")

	request_id := uuid.New().String()
	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05Z")

	targetPath := "/checkout/v1/payment"

	if os.Getenv("APP_STATUS") == "PRODUCTION" {
		api_url_doku = os.Getenv("DOKU_API_URL_PRODUCTION")
	}

	signature := lib.CreateDokuSignature(
		client_id,
		request_id,
		timestamp,
		string(payload),
		targetPath,
		secret_key,
	)

	fmt.Println(signature)

	req, err := http.NewRequest("POST",
		fmt.Sprintf("%s%s", api_url_doku, targetPath),
		bytes.NewBuffer(payload),
	)

	if err != nil {
		return "", err
	}

	req.Header.Set("Client-Id", client_id)
	req.Header.Set("Request-Id", request_id)
	req.Header.Set("Request-Timestamp", timestamp)
	req.Header.Set("Signature", "HMACSHA256="+signature)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Error sending request:", err)
		return "", err
	}
	defer resp.Body.Close()

	bodyResponse, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusOK {
		var dokuRes DokuResponse
		// Parse JSON ke struct
		if err := json.Unmarshal(bodyResponse, &dokuRes); err != nil {
			return "", err
		}

		// INI DIA LINK-NYA!
		paymentLink := dokuRes.Response.Payment.URL
		fmt.Println(paymentLink)
		return paymentLink, nil
	} else {
		return "", fmt.Errorf("Doku error: %s", string(bodyResponse))
	}
}
