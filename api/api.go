package api

import (
	"net/http"

	"bersi.bermalam.id/api/admin"
	admin_management_hotel "bersi.bermalam.id/api/admin/management-hotels"
	admin_management_rooms "bersi.bermalam.id/api/admin/management-hotels/management-rooms"
	"bersi.bermalam.id/api/auth"
	"bersi.bermalam.id/models"
	sendemail "bersi.bermalam.id/utils/sendEmail"
	"github.com/gin-gonic/gin"
)

func InitiliazeApi(g *gin.Engine) {

	g.GET("/", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, gin.H{
			"message": "Hello Semuanya!",
			"code":    http.StatusOK,
		})
	})

	g.GET("/ping", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, gin.H{
			"message":          "Daman...........",
			"ip":               c.ClientIP(),
			"request_uri":      c.Request.RequestURI,
			"Request Protocol": c.Request.Proto,
			"remote":           c.RemoteIP(),
			"code":             http.StatusOK,
			"request":          c.Request.URL,
		})
	})

	g.POST("/sign-in", auth.Login)
	g.GET("/logout", auth.Logout)

	g.POST("/sign-up-mitra", auth.RegisterMitra)

	g.POST("/verification-otp", auth.VerificationOTP)
	g.POST("/send-back-otp", auth.SendBackOTP)

	g.GET("/activate-account", auth.ActivateAccount)

	g.GET("/check-activate-account", auth.CheckActivactionAccount)
	g.GET("/check-current-session", auth.CheckCurrentSection)
	g.POST("/send-back-activate", auth.SendBackActiavateAccunt)

	// administrasi api

	// tambahkan middleware willlllllllllllllllllllllllll 1 januari 2026 damn, 9 hari lagi deadline :D
	// lu salah willl... deadline pengumpulan tanggal 6 wkwkwk, 3 hari lagi - 3 januari 2026

	g.GET("/admin/dashboard", admin.Dashboard)
	g.GET("/admin/accounts", admin.GetAccounts)
	g.GET("/admin/accounts/:id", admin.GetDetailAccount)
	g.PUT("/admin/accounts/:id", admin.UpdateAccount)
	g.DELETE("/admin/accounts/:id", admin.DeleteAccount)

	g.POST("/admin/create-account", admin.CreateAccount)

	g.GET("/admin/hotels", admin_management_hotel.DetailHotel)
	g.GET("/admin/hotels/:id", admin_management_hotel.DetailHotel)
	g.GET("/admin/type-rooms/:id", admin_management_rooms.GetDetailRooms)

	g.GET("/test-email", func(c *gin.Context) {

		email := c.Query("email")

		data := &models.SenderEmailNeeded{
			Subject: "Congratulations On Your Summit!",
			Message: "Hello, Wildan! \n Thanks FOr Summiting Yaw!",
			To:      []string{email},
			Cc:      []string{email},
		}

		if err := sendemail.SendEmail(data); err != nil {
			c.JSON(500, gin.H{
				"message": "Sending Email Wass Success",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(200, gin.H{
			"message": "Sending Email Wass Success",
		})

	})

}
