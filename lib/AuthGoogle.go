package lib

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"bersi.bermalam.id/utils"
	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var conf = oauth2.Config{
	RedirectURL:  os.Getenv("REDIRECT_URL_CALLBACK_AUTH_GOOGLE"),
	ClientID:     os.Getenv("GOOGLE_AUTH_CLIENT_ID"),
	ClientSecret: os.Getenv("GOOGLE_AUTH_CLIENT_SECRET"),
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	Endpoint:     google.Endpoint,
}

const oauth2URLGetData = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="

type GoogleUser struct {
	Email string `json:"email"`
}

type ResponseAuthURL struct {
	URL  string
	User GoogleUser
}

type ResponseAuth struct {
	Message      string
	ErrorMessage string
	Category     string
	IsSuccess    bool
	Data         ResponseAuthURL
}

func CreateOAuth2Token(c *gin.Context) ResponseAuth {

	token, err := utils.CreateRandomToken()

	if err != nil {
		return ResponseAuth{
			Message:      "There's Something Error When Creating Token Session",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	url := conf.AuthCodeURL(token)

	c.SetCookie(
		"pre-auth-google",
		token,
		60*30,
		"/",
		"localhost",
		false,
		true,
	)

	return ResponseAuth{
		Message:   "Succesfully Creating Token Authentication",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data: ResponseAuthURL{
			URL: url,
		},
	}

}

func GetGoogleAccountData(code string) ResponseAuth {

	token, err := conf.Exchange(context.Background(), code)

	if err != nil {
		return ResponseAuth{
			Message:      "There's Something Error When Exchange Code",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	response, err := http.Get(oauth2URLGetData + token.AccessToken)

	if err != nil {
		return ResponseAuth{
			Message:      "There's Something Error When Exchange Code",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer response.Body.Close()

	content, err := io.ReadAll(response.Body)

	if err != nil {
		return ResponseAuth{
			Message:      "There's Something Error When Exchange Code",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}
	var data GoogleUser

	if err = json.Unmarshal(content, &data); err != nil {
		return ResponseAuth{
			Message:      "There's Something Error When Read The Data...",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	return ResponseAuth{
		Message:   "Succesfully Getting Data...",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data: ResponseAuthURL{
			User: data,
		},
	}

}
