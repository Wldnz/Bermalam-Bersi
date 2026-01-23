package guest

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	// "time"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultHotelImage struct {
	URL      string `json:"url"`
	IsPinned bool   `json:"is_pinned"`
}

type ResultTypeRoom struct {
	ID              int    `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	MaxAdult        string `json:"max_adults"`
	MaxChildren     string `json:"max_children"`
	RoomSize        string `json:"room_size"`
	BedType         string `json:"bed_type"`
	Refundable      bool   `json:"refundable"`
	FreeCancel      bool   `json:"free_cancel"`
	HowLongToCancel int64  `json:"how_long_to_cancel"`
	// DownPayment bool `json:"down_payment"`
	DefaultPrice string `json:"default_price"`
	MinimumPrice string `json:"minimum_price"`
	TotalRooms   string `json:"total_rooms"`
	ImageURL     string `json:"image_url"`
}

type ResultFeedback struct {
	ID        int    `json:"id"`
	GuestName string `json:"guest_name"`
	Value     string `json:"value"`
	Category  string `json:"category"`
	Stars     string `json:"stars"`
	CreatedAt string `json:"created_at"`
	RoomNames string `json:"room_names"`
}

type ResultHotelLocation struct {
	ID        int    `json:"id"`
	Address_1 string `json:"address_1"`
	Address_2 string `json:"address_2"`
	ZipCode   string `json:"zip_code"`
	Country   string `json:"country"`
	Province  string `json:"province"`
	City      string `json:"city"`
	Longitude string `json:"longitude"`
	Latitude  string `json:"latitude"`
}

type ResultFAQHotel struct {
	ID       int    `json:"id"`
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

type ResultHotelFacility struct {
	ID           int    `json:"id"`
	FacilityName string `json:"facility_name"`
	CategoryName string `json:"category_name"`
}

type ResultDetailHotel struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Stars       string `json:"stars"`
}

type ResultDetailHotelResponse struct {
	ResultDetailHotel

	Location   ResultHotelLocation   `json:"location"`
	Images     []ResultHotelImage    `json:"images"`
	Facilities []ResultHotelFacility `json:"facilities"`
	TypeRooms  []ResultTypeRoom      `json:"type_rooms"`
	FeedBacks  []ResultFeedback      `json:"feedbacks"`
	Faqs       []ResultFAQHotel      `json:"faqs"`
}

type DefaultResponseDataHotel struct {
	Message      string
	ErrorMessage string
	Category     string
	IsSuccess    bool
}

type ResponseDataHotelAndLocation struct {
	Hotel    ResultDetailHotel
	Location ResultHotelLocation
}

type ResponseDetailHotel struct {
	Response DefaultResponseDataHotel
	Data     ResponseDataHotelAndLocation
}

type ResponseHotelImages struct {
	Response DefaultResponseDataHotel
	Data     []ResultHotelImage
}

type ResponseHotelFacilities struct {
	Response DefaultResponseDataHotel
	Data     []ResultHotelFacility
}

type ResponseHotelTypeRooms struct {
	Response DefaultResponseDataHotel
	Data     []ResultTypeRoom
}

type ResponseHotelFeedbacks struct {
	Response DefaultResponseDataHotel
	Data     []ResultFeedback
}

type ResponseHotelFAQS struct {
	Response DefaultResponseDataHotel
	Data     []ResultFAQHotel
}

func DetailHotel(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":     "Bring The ID Please!",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	currenTime := time.Now()
	currenTimeMili := currenTime.UnixMilli()
	tomorrowTimeMili := (60 * 60 * 24 * 1000) + currenTimeMili

	check_in := c.DefaultQuery("check_in", fmt.Sprintf("%d", currenTimeMili))
	check_out := c.DefaultQuery("check_out", fmt.Sprintf("%d", tomorrowTimeMili))
	adult := c.DefaultQuery("total_adults", "1")
	children := c.DefaultQuery("total_childrens", "0")
	room := c.DefaultQuery("total_rooms", "1")

	// hotels, hotel_images, hotel_facilities, hotel_type_rooms, hotel_rooms, hotel_feedback, faq, hotel_near_location?, hotel_type_rules, and other hotel may u like...

	HotelDetail := getHotelDetail(id)

	if !HotelDetail.Response.IsSuccess {
		if HotelDetail.Response.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     HotelDetail.Response.Message,
				"error":       HotelDetail.Response.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     HotelDetail.Response.Message,
				"error":       HotelDetail.Response.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	Images := getHotelImages(id)

	if !Images.Response.IsSuccess {
		if Images.Response.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":     Images.Response.Message,
				"error":       Images.Response.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     Images.Response.Message,
				"error":       Images.Response.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	Feedbacks := getHotelFeedbacks(id)

	if !Feedbacks.Response.IsSuccess && Feedbacks.Response.Category == "ERROR" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     Feedbacks.Response.Message,
			"error":       Feedbacks.Response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	TypeRooms := getHotelTypeRooms(id,
		check_in,
		check_out,
		adult,
		children,
		room,
	)

	if !TypeRooms.Response.IsSuccess && TypeRooms.Response.Category == "ERROR" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     TypeRooms.Response.Message,
			"error":       TypeRooms.Response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	Faqs := getHotelFaqs(id)

	if !Faqs.Response.IsSuccess && Faqs.Response.Category == "ERROR" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     Faqs.Response.Message,
			"error":       Faqs.Response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	Facilities := getHotelFacilities(id)

	if !TypeRooms.Response.IsSuccess && Facilities.Response.Category == "ERROR" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     Facilities.Response.Message,
			"error":       Facilities.Response.ErrorMessage,
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	// data.ResultDetailHotel = HotelDetail.Data.Hotel
	// data.Location = HotelDetail.Data.Location
	// data.Images = Images.Data
	// data.Facilities = Facilities.Data
	// data.TypeRooms = data.TypeRooms
	// data.Faqs = data.Faqs

	c.JSON(http.StatusOK, gin.H{
		"message":     "Sucessfully Getting Detail Data Hotel!",
		"status_code": http.StatusOK,
		"data": &ResultDetailHotelResponse{
			ResultDetailHotel: HotelDetail.Data.Hotel,
			Location:          HotelDetail.Data.Location,
			Images:            Images.Data,
			Facilities:        Facilities.Data,
			Faqs:              Faqs.Data,
			TypeRooms:         TypeRooms.Data,
			FeedBacks:         Feedbacks.Data,
		},
	})

}

func getHotelDetail(
	hotel_id string,
) ResponseDetailHotel {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseDetailHotel{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	var data ResponseDataHotelAndLocation

	query := `SELECT h.id, h.name, h.description, h.stars, hl.id AS location_id, hl.country, hl.province, hl.city, hl.zip_code, hl.address_1 AS address_1, COALESCE(hl.address_2, "-") AS address_2, hl.longitude, hl.latitude
		FROM hotels h 
		INNER JOIN hotel_location hl ON hl.id_hotel = h.id
		WHERE h.id =?`

	if err = db.QueryRow(query, hotel_id).Scan(
		&data.Hotel.ID, &data.Hotel.Name, &data.Hotel.Description, &data.Hotel.Stars,

		&data.Location.ID, &data.Location.Country, &data.Location.Province, &data.Location.City, &data.Location.ZipCode, &data.Location.Address_1, &data.Location.Address_2, &data.Location.Longitude, &data.Location.Latitude,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseDetailHotel{
				Response: DefaultResponseDataHotel{
					Message:      "Sorry, We Cannot Found The Data...",
					ErrorMessage: err.Error(),
					Category:     "NOT_FOUND",
					IsSuccess:    false,
				},
			}
		} else {
			return ResponseDetailHotel{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Getting Hotel Data...",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
	}

	return ResponseDetailHotel{
		Response: DefaultResponseDataHotel{
			Message:   "Sucessfully Get Data Hotel And Location..",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: data,
	}
}

func getHotelImages(hotel_id string) ResponseHotelImages {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseHotelImages{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	images := []ResultHotelImage{}

	rows, err := db.Query(`SELECT url, isPinned FROM hotel_images WHERE hotel_images.id_hotel = ?`, hotel_id)

	if err != nil {
		return ResponseHotelImages{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Getting Data Hotel Images",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	for rows.Next() {
		var image ResultHotelImage

		if err = rows.Scan(&image.URL, &image.IsPinned); err != nil {
			return ResponseHotelImages{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Scanning Data Hotel Images",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		images = append(images, image)
	}

	if len(images) == 0 {
		return ResponseHotelImages{
			Response: DefaultResponseDataHotel{
				Message:   "Sorry We Cannot Found Any Of Hotel Images",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseHotelImages{
		Response: DefaultResponseDataHotel{
			Message:   "Succesfully Getting Hotel Images",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: images,
	}

}
func getHotelFacilities(hotel_id string) ResponseHotelFacilities {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseHotelFacilities{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	facilities := []ResultHotelFacility{}

	query := `SELECT hf.id, cf.name AS category_facility, f.name AS facility
			FROM hotel_facilities hf
			INNER JOIN facilities f ON f.id = hf.id_facilities
			INNER JOIN category_facilities cf ON cf.id = f.id_category_facility
			WHERE hf.id_hotel = ? AND hf.category = 'hotel';`

	rows, err := db.Query(query, hotel_id)

	if err != nil {
		return ResponseHotelFacilities{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Getting Data Hotel Facilities",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	for rows.Next() {
		var facility ResultHotelFacility

		if err = rows.Scan(&facility.ID, &facility.CategoryName, &facility.FacilityName); err != nil {
			return ResponseHotelFacilities{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Scanning Data Hotel Facilities",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		facilities = append(facilities, facility)
	}

	if len(facilities) == 0 {
		return ResponseHotelFacilities{
			Response: DefaultResponseDataHotel{
				Message:   "Sorry We Cannot Found Any Of Hotel Facilities",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseHotelFacilities{
		Response: DefaultResponseDataHotel{
			Message:   "Succesfully Getting Hotel Facilities",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: facilities,
	}

}

// should send the rooms_qty?
func getHotelTypeRooms(
	hotel_id string,
	check_in string,
	check_out string,
	adult string,
	children string,
	total_rooms string,
) ResponseHotelTypeRooms {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseHotelTypeRooms{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

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

	query := fmt.Sprintf(`SELECT 
			htr.id, htr.name, htr.description, htr.free_cancel, htr.how_long_to_cancel, htr.refundable, htr.room_size, htr.bed_type, htr.max_adult, htr.max_children,
			COUNT(DISTINCT hr.id) AS total_rooms, %s AS default_price, %s AS minimum_price,
			htri.url AS image_url
		FROM hotel_type_rooms htr
		INNER JOIN hotel_type_room_price_period htrpp ON htrpp.id_type_room = htr.id AND htrpp.default=1
		INNER JOIN hotel_type_room_dynamic_price htrdp ON htrdp.id_price_period = htrpp.id
		LEFT JOIN hotel_type_room_price_period htrpp_2 ON htrpp_2.id_type_room = htr.id AND htrpp_2.default=0
		LEFT JOIN hotel_type_room_dynamic_price htrdp_2 ON htrdp_2.id_price_period = htrpp_2.id
		LEFT JOIN (
			SELECT id_type_room, MAX(url) AS url FROM  hotel_type_room_images WHERE isPinned = 1 
			GROUP BY id_type_room
			) htri ON htri.id_type_room = htr.id
		LEFT JOIN hotel_rooms hr ON hr.id_type_room = htr.id AND hr.status = 'available'
		AND hr.id NOT IN (
			SELECT id_hotel_room FROM hotel_room_bookings
			WHERE NOT (check_out_at <=  ?  OR check_in_at >= ?)
		)
		WHERE htr.id_hotel=? AND htr.max_adult >= ? AND htr.max_children >= ?
		GROUP BY htr.id, htri.url
		HAVING total_rooms >= ?;`, type_price, type_price_2)

	rows, err := db.Query(query,
		check_in,
		check_out,
		hotel_id,
		adult,
		children,
		total_rooms,
	)

	if err != nil {
		return ResponseHotelTypeRooms{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Getting Type Rooms Hotel",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	rooms := []ResultTypeRoom{}

	for rows.Next() {
		var room ResultTypeRoom

		if err = rows.Scan(&room.ID, &room.Name, &room.Description, &room.FreeCancel, &room.HowLongToCancel, &room.Refundable, &room.RoomSize, &room.BedType, &room.MaxAdult, &room.MaxChildren, &room.TotalRooms, &room.DefaultPrice, &room.MinimumPrice, &room.ImageURL); err != nil {
			return ResponseHotelTypeRooms{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Scanning Type Rooms Hotel",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		rooms = append(rooms, room)
	}

	defer rows.Close()

	if len(rooms) == 0 {
		return ResponseHotelTypeRooms{
			Response: DefaultResponseDataHotel{
				Message:   "Sorry, We Cannot Found HotelTypeRoom",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseHotelTypeRooms{
		Response: DefaultResponseDataHotel{Message: "Successfully Getting Type Rooms",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: rooms,
	}

}

func getHotelFeedbacks(hotel_id string) ResponseHotelFeedbacks {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseHotelFeedbacks{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT 
			hf.id, hf.guest_name, hf.value, hf.category, hf.stars, hf.created_at,
				GROUP_CONCAT(DISTINCT SUBSTRING_INDEX(htr.name, ',', 1) SEPARATOR ', ') AS room_names
			FROM hotel_feedback hf
				INNER JOIN transactions t ON t.id = hf.id_transaction
				INNER JOIN booking b ON b.id_transaction = t.id 
				INNER JOIN hotel_type_rooms htr ON htr.id = b.id_type_room
				INNER JOIN hotels h ON h.id = htr.id_hotel
				WHERE h.id = ?
				GROUP BY hf.id;`

	rows, err := db.Query(query, hotel_id)

	if err != nil {
		return ResponseHotelFeedbacks{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Getting Data Hotel Feedback",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	feedbacks := []ResultFeedback{}

	for rows.Next() {

		var feedback ResultFeedback

		if err = rows.Scan(&feedback.ID, &feedback.GuestName, &feedback.Value, &feedback.Category, &feedback.Stars, &feedback.CreatedAt, &feedback.RoomNames); err != nil {
			return ResponseHotelFeedbacks{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Scanning Data Hotel Feedback",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		feedbacks = append(feedbacks, feedback)
	}

	if len(feedbacks) == 0 {
		return ResponseHotelFeedbacks{
			Response: DefaultResponseDataHotel{
				Message:   "Sorry We Cannot Found Any Hotel Feedback",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseHotelFeedbacks{
		Response: DefaultResponseDataHotel{
			Message:   "Successfully Getting Hotel Feedback",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: feedbacks,
	}

}

func getHotelFaqs(hotel_id string) ResponseHotelFAQS {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseHotelFAQS{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT id, question, answer FROM faqs
	WHERE id_hotel IS NOT NULL AND category='hotel' AND id_hotel=? `

	rows, err := db.Query(query, hotel_id)

	if err != nil {
		return ResponseHotelFAQS{
			Response: DefaultResponseDataHotel{
				Message:      "There's Something Error When Getting Hotel Faqs",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	faqs := []ResultFAQHotel{}

	for rows.Next() {
		var faq ResultFAQHotel

		if err = rows.Scan(&faq.ID, &faq.Question, &faq.Answer); err != nil {
			return ResponseHotelFAQS{
				Response: DefaultResponseDataHotel{
					Message:      "There's Something Error When Scanning Hotel Faqs",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}

		faqs = append(faqs, faq)

	}

	if len(faqs) == 0 {
		return ResponseHotelFAQS{
			Response: DefaultResponseDataHotel{
				Message:   "Sorry We Cannot Found Any Hotel Faqs",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseHotelFAQS{
		Response: DefaultResponseDataHotel{
			Message:   "Successfully Getting Hotel Feedback",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: faqs,
	}

}
