package sendemail

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"

	_ "github.com/joho/godotenv/autoload"
)

type MyError struct {
	message string
}

func SendEmail(
	to []string,
	cc []string,
	message string,
) error {

	emailSender := os.Getenv("EMAIL_SENDER")
	emailSenderPassword := os.Getenv("EMAIL_SENDER_PASSWORD")
	emailSenderHost := os.Getenv("EMAIL_SENDER_HOST")
	emailSenderPORT := os.Getenv("EMAIL_SENDER_PORT")

	// if message == "" {
	// 	return &MyError{
	// 		message: "",
	// 	}
	// }

	// to := []string{"wildanofficial32@gmail.com"}
	// cc := []string{"wildanizharalhaqq@gmail.com"} // cc sama aja gak si kayak to?
	body := fmt.Sprintf("From: Informasi <%s>\n", emailSender) +
		"To: " + strings.Join(to, ",") + "\n" +
		"Cc: " + strings.Join(cc, ",") + "\n" +
		"Subject: Test Mail\n\n" +
		message

	auth := smtp.PlainAuth("", emailSender, emailSenderPassword, emailSenderHost)
	smtpAddr := fmt.Sprintf("%s:%s", emailSenderHost, emailSenderPORT)

	err := smtp.SendMail(smtpAddr, auth, emailSender, to, []byte(body))
	if err != nil {
		fmt.Println(err.Error())
		return err
	}

	return nil
}
