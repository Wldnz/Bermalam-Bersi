package api

import (
	"net/http"

	"bersi.bermalam.id/api/admin"
	"bersi.bermalam.id/api/auth"
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

	// administrasi api

	// tambahkan middleware willlllllllllllllllllllllllll 1 januari 2026 damn, 9 hari lagi deadline :D

	g.GET("/admin/dashboard", admin.Dashboard)
	g.GET("/admin/accounts", admin.GetAccounts)
	g.GET("/admin/accounts/:id", admin.GetDetailAccount)
	g.PUT("/admin/accounts/:id", admin.UpdateAccount)
	g.DELETE("/admin/accounts/:id", admin.DeleteAccount)

	g.POST("/admin/create-account", admin.CreateAccount)

}
