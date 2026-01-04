package admin

import (
	"net/http"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultHotels struct {
	ID             int    `json:"id"`
	Name           string `json:"name"`
	TotalOrders    int    `json:"total_orders"`
	TotalFeedBacks int    `json:"total_feedbacks"`
	// Commition      int    `json:"commition"`
	Status string `json:"status"`
}

func GetHotels(c *gin.Context) {

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	rows, err := db.Query(`SELECT h.id, h.name,
			COUNT(DISTINCT b.id) AS total_orders, COUNT(DISTINCT hf.id) AS total_feedbacks,
			CASE
				WHEN hd.id IS NULL THEN 'unverified'
			END AS status
				FROM hotels h
					LEFT JOIN hotel_documents hd ON hd.id_hotel = h.id
					LEFT JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
					LEFT JOIN booking b ON b.id_type_room = htr.id
					LEFT JOIN hotel_feedback hf ON hf.id_type_room = htr.id

				GROUP BY h.id, h.name, hd.id
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting Hotel Data",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer rows.Close()

	var hotels []ResultHotels

	for rows.Next() {
		var hotel ResultHotels
		if err = rows.Scan(&hotel.ID, &hotel.Name, &hotel.TotalOrders, &hotel.TotalFeedBacks, &hotel.Status); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Hotel Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		hotels = append(hotels, hotel)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Hotels!",
		"data":        hotels,
		"status_code": http.StatusOK,
	})

}
