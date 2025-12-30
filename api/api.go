package api

import (
	"net/http"

	"bersi.bermalam.id/api/auth/activate"
	check_activation "bersi.bermalam.id/api/auth/check-activation"
	checkcurrentsession "bersi.bermalam.id/api/auth/check-current-session"
	"bersi.bermalam.id/api/auth/login"
	"bersi.bermalam.id/api/auth/logout"
	"bersi.bermalam.id/api/auth/otp_handle"
	"bersi.bermalam.id/api/auth/register"
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

	g.POST("/sign-in", login.Login)
	g.POST("/sign-up", register.RegisterMitra)
	g.GET("/logout", logout.Logout)
	g.POST("/verification-otp", otp_handle.VerificationOTP)
	g.POST("/send-back-otp", otp_handle.SendBackOTP)
	g.POST("/register-mitra", register.RegisterMitra)
	g.GET("/activate-account", activate.ActivateAccount)
	g.GET("/check-activate-account", check_activation.CheckActivactionAccount)
	g.GET("/check-current-session", checkcurrentsession.CheckCurrentSection)

}
