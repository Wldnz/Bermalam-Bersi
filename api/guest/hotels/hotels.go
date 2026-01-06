package guest

import (
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultDataHotel struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Stars       string `json:"stars"`

	Images       any
	DefaultPrice string `json:"default_price"`
	CurrentPrice string `json:"current_price"`
}

func FindHotels(c *gin.Context) {

	currenTime := time.Now()
	currenTimeMili := currenTime.UnixMilli()
	tomorrowTimeMili := (60 * 60 * 24 * 1000) + currenTimeMili

	search := c.Query("search")
	check_in := c.DefaultQuery("check_in", fmt.Sprintf("%d", currenTimeMili))
	check_out := c.DefaultQuery("check_out", fmt.Sprintf("%d", tomorrowTimeMili))
	adult := c.DefaultQuery("total_adults", "1")
	children := c.DefaultQuery("total_childrens", "0")
	room := c.DefaultQuery("total_rooms", "1")
	category := c.DefaultQuery("category_property", "all")

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// sebentar... hotel membutuhkan dokumen dan status verifikasi adalah valid untuk muncul di halaman pencarian yaw!
	// untuk saat ini belum digunakan...., karena deadline mepet banget :D
	query := `SELECT h.id, h.name, h.description, h.stars, FROM hotels h  
		INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
		INNER JOIN hotel_location hl ON hl.id_hotel = h.id
			WHERE h.name LIKE ? OR hl.location LIKE ?
				AND htr.max_adult >= ? AND htr.max_children >= ?`

	// SELECT
	// 	h.id, h.name, h.description, h.stars,
	// 	COUNT(hr.id) AS total_rooms
	//  FROM hotels h
	// 		INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
	// 		INNER JOIN hotel_location hl ON hl.id_hotel = h.id
	// 		INNER JOIN hotel_rooms hr ON hr.id_type_room = htr.id
	// 			WHERE hr.status = 'available'
	// 			# AND h.name LIKE ? OR hl.location LIKE ?
	// 			#	AND htr.max_adult >= ? AND htr.max_children >= ?
	// 				GROUP BY h.id
	searchParam := "%" + search + "%"

	rows, err := db.Query(query, searchParam, searchParam, adult, children)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting Hotels",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}
	hotels := []ResultDataHotel{}

	defer rows.Close()

	for rows.Next() {
		var hotel ResultDataHotel

		if err = rows.Scan(&hotel.ID, &hotel.Name, &hotel.Description, &hotel.Stars); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Scanning Data Hotels",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		hotels = append(hotels, hotel)
	}

	// nyari image dlu?

	if len(hotels) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry We Cannot Found Hotel",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Hotels",
		"data":        hotels,
		"status_code": http.StatusOK,
	})

}
