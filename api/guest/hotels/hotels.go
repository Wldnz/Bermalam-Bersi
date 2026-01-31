package guest

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
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

type ResultRecomendation struct {
	ID       int    `json:"id"`
	HotelID  int    `json:"hotel_id"`
	Label    string `json:"label"`
	City     string `json:"city"`
	Province string `json:"province"`
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

	defer db.Close()

	room_int, err := strconv.Atoi(total_rooms)

	if err != nil {
		// should i send error response?
		room_int = 1
	}

	if category == "" {
		category = "all"
	}

	checkInNumber, _ := strconv.Atoi(check_in)
	checkOutNumber, _ := strconv.Atoi(check_out)

	minimumBookDayMili := (60 * 60 * 24 * 1000)
	whatLevelIsIt := checkOutNumber - checkInNumber
	levelTransaction := "night"

	if whatLevelIsIt >= minimumBookDayMili*7 {
		levelTransaction = "long_stay"
	} else if whatLevelIsIt >= minimumBookDayMili*2 {
		levelTransaction = "two_night"
	} else if whatLevelIsIt >= minimumBookDayMili {
		levelTransaction = "night"
	}

	type_price := `CAST(MIN(htrdp.price_per_night) AS SIGNED)`
	type_price_2 := `CAST(COALESCE(MIN(htrdp_2.price_per_night), 0) AS SIGNED)`

	switch levelTransaction {
	case "long_stay":
		type_price = "CAST(MIN(htrdp.price_long_stay) AS SIGNED)"
		type_price_2 = "CAST(COALESCE(MIN(htrdp_2.price_long_stay), 0) AS SIGNED)"
	case "two_night":
		type_price = "CAST(MIN(htrdp.price_per_two_night) AS SIGNED)"
		type_price_2 = "CAST(COALESCE(MIN(htrdp_2.price_per_two_night), 0) AS SIGNED)"
	default:
		type_price = "CAST(MIN(htrdp.price_per_night) AS SIGNED)"
		type_price_2 = "CAST(COALESCE(MIN(htrdp_2.price_per_night), 0) AS SIGNED)"
	}

	// sebentar... hotel membutuhkan dokumen dan status verifikasi adalah valid untuk muncul di halaman pencarian yaw!
	// untuk saat ini belum digunakan...., karena deadline mepet banget :D
	// masih ada kendala, ketika status kamarnya selain available maka bisa dipastikan kamarnya tidak akan muncul saa query dilakukan :D
	// well, kalo di sistem hotel beneran, ketika memesan kamar, tamu itu bisa memesan lebih dari 1 kamar asalkan tipe kamarnya sama, karena biasanya yang memesan adalah keluarga yang ingin berdekatan dan mencegah adanya komplain
	query := fmt.Sprintf(`SELECT 
	h.id, h.name, h.description, h.stars, 
	%s AS default_price,
	%s AS minimun_price,
	COUNT(DISTINCT hr.id) AS total_rooms,
	COALESCE(hi.url, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyNfRFSIbyb40oYPjza5OgYytSKB5U0019ZQ&s') AS image_url
 FROM hotels h  
		INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
		INNER JOIN hotel_location hl ON hl.id_hotel = h.id
		INNER JOIN hotel_rooms hr ON hr.id_type_room = htr.id AND hr.id NOT IN (
			SELECT id_hotel_room FROM hotel_room_bookings
			WHERE NOT (check_out_at <=  ?  OR check_in_at >= ?) # pertama '?' check_in kedua check_out
			AND status = 'pending'
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
				HAVING total_rooms >= ?`, type_price, type_price_2)

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

func RecomendationLocationHotel(c *gin.Context) {

	search := c.Query("search")

	if search == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Please Bring The Search Result",
			"status_code": http.StatusBadRequest,
		})
		return
	}

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

	query := `SELECT hl.id, h.id as hotel_id, CONCAT(h.name, ", ", hl.city, ", ", hl.province) as label, hl.city, hl.province FROM hotel_location hl
		INNER JOIN hotels h ON h.id = hl.id_hotel
			WHERE (h.name LIKE ? OR
					hl.city LIKE ? OR
						hl.province LIKE ?)
			LIMIT 5`

	searchParam := "%" + strings.ToLower(search) + "%"

	recomendations := []ResultRecomendation{}

	rows, err := db.Query(query, searchParam, searchParam, searchParam)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Getting Data",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer rows.Close()

	for rows.Next() {

		var recomendation ResultRecomendation

		if err = rows.Scan(&recomendation.ID, &recomendation.HotelID, &recomendation.Label, &recomendation.City, &recomendation.Province); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Scanning Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		recomendations = append(recomendations, recomendation)
	}

	if len(recomendations) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry We Cannot Found Any Data... ",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Recommendation Text",
		"data":        recomendations,
		"status_code": http.StatusOK,
	})

}
