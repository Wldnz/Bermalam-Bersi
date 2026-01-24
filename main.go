package main

import (
	"time"

	"github.com/gin-gonic/gin"

	"bersi.bermalam.id/api"
	"github.com/gin-contrib/cors"
)

type User struct {
	ID         int    `json:"id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
	PhoneCode  string `json:"phone_code"`
	Phone      string `json:"phone"`
	Password   string `json:"password"`
	VerifiedAt string `json:"verified_at"`
	Status     string `json:"status"`
}

type ActivateAccount struct {
	UserID int    `json:"user_id"`
	Token  string `json:"token"`
}

func main() {

	g := gin.New()

	g.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5000", "https://example.com"}, // Allowed domains
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},                               // Allowed HTTP methods
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},                               // Allowed request headers
		ExposeHeaders:    []string{"Content-Length"},                                                        // Headers exposed to the browser
		AllowCredentials: true,                                                                              // Allow cookies/auth headers
		MaxAge:           12 * time.Hour,                                                                    // Cache preflight response
	}))

	api.InitiliazeApi(g)

	g.Run(":8000")

}
