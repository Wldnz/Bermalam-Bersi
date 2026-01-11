package guest

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	// "time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultDataHotel struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Stars       string `json:"stars"`

	DefaultPrice string `json:"default_price"`
	MinimumPrice string `json:"minimum_price"`
	TotalRooms   string `json:"total_rooms"`
	ImageURL     string `json:"image_url"`
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
	total_rooms := c.DefaultQuery("total_rooms", "1")
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

	room_int, err := strconv.Atoi(total_rooms)

	if err != nil {
		// should i send error response?
		room_int = 1
	}

	if category == "" {
		category = "all"
	}

	// sebentar... hotel membutuhkan dokumen dan status verifikasi adalah valid untuk muncul di halaman pencarian yaw!
	// untuk saat ini belum digunakan...., karena deadline mepet banget :D
	// masih ada kendala, ketika status kamarnya selain available maka bisa dipastikan kamarnya tidak akan muncul saa query dilakukan :D
	// well, kalo di sistem hotel beneran, ketika memesan kamar, tamu itu bisa memesan lebih dari 1 kamar asalkan tipe kamarnya sama, karena biasanya yang memesan adalah keluarga yang ingin berdekatan dan mencegah adanya komplain
	query := `SELECT 
	h.id, h.name, h.description, h.stars, 
	MIN(htrdp.price_per_night) AS default_price,
	COALESCE(MIN(htrdp_2.price_per_night),0) AS minimun_price,
	COUNT(DISTINCT hr.id) AS total_rooms,
	hi.url AS image_url
 FROM hotels h  
		INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
		INNER JOIN hotel_location hl ON hl.id_hotel = h.id
		INNER JOIN hotel_rooms hr ON hr.id_type_room = htr.id AND hr.id NOT IN (
			SELECT id_hotel_room FROM hotel_room_bookings
			WHERE NOT (check_out_at <=  ?  OR check_in_at >= ?) # pertama '?' check_in kedua check_out
		)
		INNER JOIN hotel_type_room_price_period htrpp ON htrpp.id_type_room = htr.id
		INNER JOIN hotel_type_room_dynamic_price htrdp ON htrdp.id_price_period = htrpp.id AND htrpp.default = 1
		LEFT JOIN hotel_type_room_price_period htrpp_2 ON htrpp_2.id_type_room = htr.id
		LEFT JOIN hotel_type_room_dynamic_price htrdp_2 ON htrdp_2.id_price_period = htrpp_2.id AND htrpp_2.default = 0
		LEFT JOIN (
			SELECT id_hotel, url FROM hotel_images WHERE isPinned = 1 LIMIT 1  
		) hi ON hi.id_hotel = h.id
			WHERE hr.status = 'available' AND (? = 'all' OR h.property_type = ?)
			AND (h.name LIKE ? OR hl.city LIKE ? OR hl.province LIKE ?) 
			AND htr.max_adult >= ? AND htr.max_children >= ?
				GROUP BY h.id, hi.url
				HAVING total_rooms >= ?`

	searchParam := "%" + search + "%"

	// gemini said that room should be convert into int, cause it will make bunch on search this hotel lol...
	// ini valid btw wkwkwk, msnya jadi kurang beberapa (jadi lebih cepet pastinya wkwkwk)
	rows, err := db.Query(query, check_in, check_out, category, category, searchParam, searchParam, searchParam, adult, children, room_int)
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

		if err = rows.Scan(&hotel.ID, &hotel.Name, &hotel.Description, &hotel.Stars, &hotel.DefaultPrice, &hotel.MinimumPrice, &hotel.TotalRooms, &hotel.ImageURL); err != nil {
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
