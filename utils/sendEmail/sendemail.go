package sendemail

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"

	"bersi.bermalam.id/models"
	_ "github.com/joho/godotenv/autoload"
)

func SendEmail(data *models.SenderEmailNeeded) error {

	emailSender := os.Getenv("EMAIL_SENDER")
	emailSenderPassword := os.Getenv("EMAIL_SENDER_PASSWORD")
	emailSenderHost := os.Getenv("EMAIL_SENDER_HOST")
	emailSenderPORT := os.Getenv("EMAIL_SENDER_PORT")

	body := fmt.Sprintf("From: Informasi <%s>\n", emailSender) +
		"To: " + strings.Join(data.To, ",") + "\n" +
		"Cc: " + strings.Join(data.Cc, ",") + "\n" +
		"Subject: " + data.Subject + "\n\n" +
		data.Message

	auth := smtp.PlainAuth("", emailSender, emailSenderPassword, emailSenderHost)
	smtpAddr := fmt.Sprintf("%s:%s", emailSenderHost, emailSenderPORT)

	err := smtp.SendMail(smtpAddr, auth, emailSender, data.To, []byte(body))
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	return nil
}
