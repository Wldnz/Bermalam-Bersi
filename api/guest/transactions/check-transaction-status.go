package guest_transactions

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"bersi.bermalam.id/lib"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	_ "github.com/joho/godotenv/autoload"
)

type TransactionInvoiceDoku struct {
	ID              int    `json:"id"`
	InvoiceNumberID int    `json:"invoice_number_id"`
	PaymentLink     string `json:"payment_link"`
}

func CheckTransactionStatus(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	invoiceNumber := c.Param("invoice")

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry, You Must Login...",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	defer db.Close()

	statusTransaction, err := getStatusTransaction(invoiceNumber)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "There's Something Error When Getting Status Transaction",
			"error":       err.Error(),
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Succesfully Getting Transaction Status...",
		"data":               statusTransaction,
		"status_transaction": statusTransaction,
		"status_code":        http.StatusOK,
	})

}

type DokuResponseStatusTransaction struct {
	Transaction struct {
		Status string `json:"status"`
	} `json:"transaction"`
}

func getStatusTransaction(invoice_number_id string) (string, error) {
	client_id := os.Getenv("DOKU_CLIENT_ID")
	secret_key := os.Getenv("DOKU_ACTIVE_SECRET_KEY")
	api_url_doku := os.Getenv("DOKU_API_URL_SANDBOX")

	request_id := uuid.New().String()
	timestamp := time.Now().UTC().Format("2006-01-02T15:04:05Z")

	targetPath := "/orders/v1/status/" + invoice_number_id

	if os.Getenv("APP_STATUS") == "PRODUCTION" {
		api_url_doku = os.Getenv("DOKU_API_URL_PRODUCTION")
	}

	signature := lib.CreateDokuSignatureMethodGET(
		client_id,
		request_id,
		timestamp,
		targetPath,
		secret_key,
	)

	req, err := http.NewRequest("GET",
		api_url_doku+targetPath,
		nil,
	)

	if err != nil {
		return "", err
	}

	req.Header.Set("Client-Id", client_id)
	req.Header.Set("Request-Id", request_id)
	req.Header.Set("Request-Timestamp", timestamp)
	req.Header.Set("Signature", "HMACSHA256="+signature)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Error sending request:", err)
		return "", err
	}
	defer resp.Body.Close()

	bodyResponse, _ := io.ReadAll(resp.Body)

	if resp.StatusCode == http.StatusOK {
		var dokuRes DokuResponseStatusTransaction
		// Parse JSON ke struct
		if err := json.Unmarshal(bodyResponse, &dokuRes); err != nil {
			return "", err
		}

		// INI DIA LINK-NYA!
		statusTransaction := dokuRes.Transaction.Status
		return statusTransaction, nil
	} else {
		return "", fmt.Errorf("Doku error: %s", string(bodyResponse))
	}
}
