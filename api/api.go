package api

import (
	"fmt"
	"net/http"

	"bersi.bermalam.id/api/admin"
	admin_management_hotel "bersi.bermalam.id/api/admin/management-hotels"
	admin_management_rooms "bersi.bermalam.id/api/admin/management-hotels/management-rooms"
	"bersi.bermalam.id/api/auth"
	guest_discount "bersi.bermalam.id/api/guest/discounts"
	guest_faqs "bersi.bermalam.id/api/guest/faqs"
	guest "bersi.bermalam.id/api/guest/hotels"
	hotel_room "bersi.bermalam.id/api/guest/hotels/rooms"
	guest_transactions "bersi.bermalam.id/api/guest/transactions"
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
	g.POST("/sign-in-google", auth.LoginWithGoogle)
	g.GET("/auth/google", auth.LoginWithGoogleCallBack)
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
	// dan sekarang tanggal 7 progress gak bedah jauh wwkwkwk....

	g.GET("/admin/dashboard", admin.Dashboard)
	g.GET("/admin/accounts", admin.GetAccounts)
	g.GET("/admin/accounts/:id", admin.GetDetailAccount)
	g.PUT("/admin/accounts/:id", admin.UpdateAccount)
	g.DELETE("/admin/accounts/:id", admin.DeleteAccount)

	g.POST("/admin/create-account", admin.CreateAccount)

	g.GET("/admin/hotels", admin_management_hotel.DetailHotel)
	g.GET("/admin/hotels/:id", admin_management_hotel.DetailHotel)
	g.GET("/admin/type-rooms/:id", admin_management_rooms.GetDetailRooms)

	// guest / public api
	g.GET("/hotels", guest.FindHotels)
	g.GET("/hotels/:id", guest.DetailHotel)
	g.GET("/hotel-recomendation-name", guest.RecomendationLocationHotel)

	// detail room
	g.GET("/rooms/:id", hotel_room.GetDetailRoom)

	g.POST("/create-booking", guest_transactions.CreateTransaction)
	g.GET("/status-transaction-doku/:invoice", guest_transactions.CheckTransactionStatus)
	g.POST("/transactions/callback", guest_transactions.CallBackTransactionDoku)

	g.GET("/transactions", guest_transactions.HistoryTransactions)
	g.GET("/transactions/:id", guest_transactions.DetailTransaction)

	g.GET("/faqs", guest_faqs.GetFAQS)

	g.GET("/vouchers", guest_discount.GetDiscounts)

	g.GET("/byte-to-string", func(c *gin.Context) {

		c.JSON(200, gin.H{
			"message": "OK",
			"data":    fmt.Sprintf("%s", "ewogICJpZCI6ICIxMTEyMzI2OTY1ODA3OTAxMDk4MjQiLAogICJlbWFpbCI6ICJ3aWxkYW5vZmZpY2lhbDMyQGdtYWlsLmNvbSIsCiAgInZlcmlmaWVkX2VtYWlsIjogdHJ1ZSwKICAicGljdHVyZSI6ICJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQUxWLVVqWHZrTVoyVEN5VjI2RTVKLWRzcVZLODBfNWhMU2RBTXVZQVRnTmlTRlJMaE5iNWRzbzk9czk2LWMiCn0K"),
		})
	})

	// booking hotel management here

}
