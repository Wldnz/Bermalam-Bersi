package admin_management_rooms

import (
	"database/sql"
	"fmt"
	"net/http"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/models"
	"github.com/gin-gonic/gin"
)

type ResponseMenuTypeRoom struct {
	Message      string
	ErrorMessage string
	Category     string
	Data         interface{}
	IsSuccess    bool
}

type ResultDynamicPriceRoom struct {
	ID       int    `json:"id"`
	Night    string `json:"per_night"`
	TwoNight string `json:"two_night"`
	LongStay string `json:"long_stay"`
	Category string `json:"category"`
}

type ResultPeriodPrice struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	StartAt int64  `json:"start_at"`
	EndAt   int64  `json:"end_at"`
	Status  string `json:"status"`
	Default int    `json:"default"`
	Prices  []ResultDynamicPriceRoom
}

type ResultRoom struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	// Telp        string `json:"telp"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
}

type ResultDetailRoom struct {
	ResultRoom
	Telp      string `json:"telp"`
	UpdatedAt string `json:"updated_at"`
	CreatedBy string `json:"created_by"`
	UpdatedBy string `json:"updated_by"`
}

type ResultHotelFacility struct {
	ID           int    `json:"id"`
	FacilityName string `json:"facility_name"`
	CategoryName string `json:"category_name"`
	CreatedAt    string `json:"created_at"`
}

type ResultCategoryFacility struct {
	ID          int    `json:"id"`
	Name        int    `json:"name"`
	Description string `json:"description"`
}

type ResultFacility struct {
	ID         int    `json:"id"`
	IDCategory int    `json:"id_category"`
	Name       string `json:"facility_name"`
}

type ResultDetailFacility struct {
	ResultHotelFacility
	UpdatedAt string `json:"updated_at"`
	// CreatedBy string `json:"created_by"`
	// UpdatedBy string `json:"updated_by"`
	// CategoryFacilities []ResultCategoryFacility `json:"category_facilities"`
	// Facilities         []ResultFacility `json:"facilities"`
}

type ResultBenefitRoom struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Category  string `json:"category"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type ResultRulesRoom struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Category  string `json:"category"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func GetDetailRooms(c *gin.Context) {

	type_room_id := c.Param("id")

	if type_room_id == "" {
		c.JSON(http.StatusBadGateway, gin.H{
			"message":     "Please Bring The ID!",
			"status_code": http.StatusBadGateway,
		})
		return
	}

	id := c.Query("id")

	menu := c.DefaultQuery("tab_menu", "period")
	search := c.Query("search")

	var response ResponseMenuTypeRoom

	switch menu {
	case "period":
		data := periodPricesTypeRoom(type_room_id, search)
		response = data
	case "detail-period":
		data := detailPeriodPrice(id)
		response = data
	case "rooms":
		data := rooms(type_room_id, search)
		response = data
	case "detail-room":
		data := detailRoom(id)
		response = data
	case "facilities":
		data := facilitesTypeRoom(type_room_id, search)
		response = data
	case "detail-facilities":
		data := detailFacilitiesTypeRoom(id)
		response = data
	case "benefits":
		data := benefitTypeRoom(type_room_id, search)
		response = data
	case "detail-benefit":
		data := detailBenefitTypeRoom(id)
		response = data
	case "rules":
		data := rulesTypeRoom(type_room_id, search)
		response = data
	case "detail-rules":
		data := detailrulesTypeRoom(id)
		response = data
	default:
		c.JSON(http.StatusBadGateway, gin.H{
			"message":     fmt.Sprintf("Sorry, We Cannot Process menu %s", menu),
			"status_code": http.StatusBadGateway,
		})
		return
	}

	if !response.IsSuccess {
		if response.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"Message":     response.Message,
				"error":       response.ErrorMessage,
				"status_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"Message":     response.Message,
				"error":       response.ErrorMessage,
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"Message":     response.Message,
		"data":        response.Data,
		"status_code": http.StatusOK,
	})

}

func periodPricesTypeRoom(
	type_room_id string,
	search string,
) ResponseMenuTypeRoom {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	data := []ResultPeriodPrice{}

	query := `SELECT p.id, p.name, p.start_at, p.end_at, p.status, p.default FROM hotel_type_room_price_period p WHERE id_type_room=?`

	searchParam := "%" + search + "%"

	var initQuery models.IntiliazeQueryRows

	if search != "" {
		query += ` AND name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Data",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	for initQuery.Rows.Next() {
		var period ResultPeriodPrice
		if err = initQuery.Rows.Scan(
			&period.ID, &period.Name, &period.StartAt, &period.EndAt, &period.Status, &period.Default,
		); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		data = append(data, period)
	}

	if len(data) == 0 {
		return ResponseMenuTypeRoom{
			Message:   "We Cannot Found Any Period Price....",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	} else {
		for key, value := range data {
			// data price yang diambil, hanya data default saja...
			if value.Default == 1 {
				rowsPeriodPrice, err := db.Query(`SELECT id, price_per_night, price_per_two_night, price_long_stay, category FROM hotel_type_room_dynamic_price WHERE id_price_period=?`, value.ID)

				if err != nil {
					return ResponseMenuTypeRoom{
						Message:      "There's Something Error When Getting Prices",
						ErrorMessage: err.Error(),
						Category:     "ERROR",
						IsSuccess:    false,
					}
				}

				defer rowsPeriodPrice.Close()

				for rowsPeriodPrice.Next() {

					var price ResultDynamicPriceRoom
					if err = rowsPeriodPrice.Scan(
						&price.ID, &price.Night, &price.TwoNight, &price.LongStay, &price.Category,
					); err != nil {
						return ResponseMenuTypeRoom{
							Message:      "There's Something Error When Scanning Prices",
							ErrorMessage: err.Error(),
							Category:     "ERROR",
							IsSuccess:    false,
						}
					}
					data[key].Prices = append(value.Prices, price)
				}
			}
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Data Period Price",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}
}

func detailPeriodPrice(period_id string) ResponseMenuTypeRoom {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var data ResultPeriodPrice

	query := `SELECT p.id, p.name, p.start_at, p.end_at, p.status, p.default   FROM hotel_type_room_price_period p WHERE id=?`

	if err = db.QueryRow(query, period_id).Scan(&data.ID, &data.Name, &data.StartAt, &data.EndAt, &data.Status, &data.Default); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuTypeRoom{
				Message:      "We Cannot Found Any Period Price....",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Getting Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	rowsPeriodPrice, err := db.Query(`SELECT id, price_per_night, price_per_two_night, price_long_stay, category FROM hotel_type_room_dynamic_price WHERE id_price_period=?`, data.ID)

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Prices",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer rowsPeriodPrice.Close()

	for rowsPeriodPrice.Next() {

		var price ResultDynamicPriceRoom
		if err = rowsPeriodPrice.Scan(
			&price.ID, &price.Night, &price.TwoNight, &price.LongStay, &price.Category,
		); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Prices",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		data.Prices = append(data.Prices, price)
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Data Period Price",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

func rooms(
	type_room_id string,
	search string,
) ResponseMenuTypeRoom {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	rooms := []ResultRoom{}

	searchParam := "%" + search + "%"

	var initQuery models.IntiliazeQueryRows

	query := `SELECT id, name, description, status, created_at FROM hotel_rooms WHERE id_type_room=?`

	if search != "" {
		query += ` AND name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Rooms!",
			Category:     "ERROR",
			ErrorMessage: initQuery.Error.Error(),
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	for initQuery.Rows.Next() {
		var room ResultRoom

		if err = initQuery.Rows.Scan(&room.ID, &room.Name, &room.Description, &room.Status, &room.CreatedAt); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Rooms Data!",
				Category:     "ERROR",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}
		rooms = append(rooms, room)
	}

	if len(rooms) == 0 {
		return ResponseMenuTypeRoom{
			Message:   "Cannot Found Rooms",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Rooms",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      rooms,
	}

}

func detailRoom(room_id string) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	query := `SELECT id, name, description, telp status, created_at, updated_at, created_by, updated_by FROM hotel_rooms WHERE id=?`

	rows, err := db.Query(query, room_id)

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Detail Room From Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer rows.Close()

	room := ResultDetailRoom{}

	for rows.Next() {
		if err = rows.Scan(&room.ID, &room.Name, &room.Telp, &room.Status, &room.CreatedAt, &room.UpdatedAt, &room.CreatedBy, &room.CreatedBy); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Detail Room",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	if room.ID == 0 {
		return ResponseMenuTypeRoom{
			Message:   "Cannot Found Room!",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Successfully Getting Detail Room!",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      room,
	}

}

func facilitesTypeRoom(
	type_room_id string,
	search string,
) ResponseMenuTypeRoom {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var initQuery models.IntiliazeQueryRows

	searchParam := "%" + search + "%"

	query := `SELECT hf.id, f.name AS facility_name, cf.name AS category_name, hf.created_at FROM category_facilities cf
	INNER JOIN facilities f ON f.id_category_facility = cf.id 
		INNER JOIN hotel_facilities hf ON hf.id_facilities = f.id
			WHERE hf.id_type_room=? AND category='room'`

	if search != "" {
		query += ` AND f.name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Room Facilities",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	facilities := []ResultHotelFacility{}

	for initQuery.Rows.Next() {
		var facility ResultHotelFacility

		if err = initQuery.Rows.Scan(&facility.ID, &facility.FacilityName, &facility.CategoryName, &facility.CreatedAt); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Room Facilities",
				ErrorMessage: initQuery.Error.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		facilities = append(facilities, facility)
	}

	if len(facilities) == 0 {
		return ResponseMenuTypeRoom{
			Message:   "Sorry We Cannot Found Facility...",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Room Facilities",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      facilities,
	}
}

func detailFacilitiesTypeRoom(facility_id string) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var data ResultDetailFacility

	query := `SELECT hf.id, f.name AS facility_name, cf.name AS category_name, hf.created_at, hf.updated_at FROM category_facilities cf
	INNER JOIN facilities f ON f.id_category_facility = cf.id 
		INNER JOIN hotel_facilities hf ON hf.id_facilities = f.id
			WHERE hf.id=? AND category='room'`

	if err = db.QueryRow(query, facility_id).Scan(&data.ID, &data.FacilityName, &data.CategoryName, &data.CreatedAt, &data.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuTypeRoom{
				Message:      "Cannot Found Detail Room Facility",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Getting Detail Room Facility",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfuly Getting Detail Room Facility",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

func benefitTypeRoom(
	type_room_id string,
	search string,
) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	query := `SELECT id, name, category, created_at, updated_at FROM hotel_type_room_benefit WHERE id_type_room=?`

	searchParams := "%" + search + "%"

	var initQuery models.IntiliazeQueryRows

	if search != "" {
		query += ` AND name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id, searchParams)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id)
	}

	// var

	if initQuery.Error != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Benefits Room",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	benefits := []ResultBenefitRoom{}

	for initQuery.Rows.Next() {
		var benefit ResultBenefitRoom

		if err = initQuery.Rows.Scan(&benefit.ID, &benefit.Name, &benefit.Category, &benefit.CreatedAt, &benefit.Category); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Data Benefits Room",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

		benefits = append(benefits, benefit)
	}

	if len(benefits) == 0 {
		return ResponseMenuTypeRoom{
			Message:   "Sorry We Cannot FOUND The Benefits",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Benefits Room",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      benefits,
	}

}
func detailBenefitTypeRoom(
	benefit_id string,
) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var benefit ResultBenefitRoom

	query := `SELECT id, name, category, created_at, updated_at FROM hotel_type_room_benefit WHERE id=?`

	if err = db.QueryRow(query, benefit_id).Scan(&benefit.ID, &benefit.Name, &benefit.Category, &benefit.CreatedAt, &benefit.Category); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuTypeRoom{
				Message:      "Sorry We Cannot FOUND The Benefits",
				Category:     "NOT_FOUND",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Getting Benefits Room",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Benefits Room",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      benefit,
	}

}

func rulesTypeRoom(
	type_room_id string,
	search string,
) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var initQuery models.IntiliazeQueryRows

	searchParam := "%" + search + "%"

	query := `SELECT id, name, category, created_at, updated_at FROM hotel_type_room_rules WHERE id_type_room=?`

	if search != "" {
		query += ` AND name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, type_room_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Getting Room Rules",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	ruless := []ResultRulesRoom{}

	for initQuery.Rows.Next() {
		var rules ResultRulesRoom

		if err = initQuery.Rows.Scan(&rules.ID, &rules.Name, &rules.Category, &rules.CreatedAt, &rules.UpdatedAt); err != nil {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Scanning Data Room Rules",
				ErrorMessage: initQuery.Error.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

		ruless = append(ruless, rules)

	}

	if len(ruless) == 0 {
		return ResponseMenuTypeRoom{
			Message:   "Sorry We Cannot Found Rules For This Room...",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Room Rules",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      ruless,
	}
}

func detailrulesTypeRoom(rules_id string) ResponseMenuTypeRoom {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuTypeRoom{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()
	query := `SELECT id, name, category, created_at, updated_at FROM hotel_type_room_rules WHERE id=?`

	var rules ResultRulesRoom

	if err = db.QueryRow(query, rules_id).Scan(&rules.ID, &rules.Name, &rules.Category, &rules.CreatedAt, &rules.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuTypeRoom{
				Message:   "Sorry We Cannot Found Rules For This Room...",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			}
		} else {
			return ResponseMenuTypeRoom{
				Message:      "There's Something Error When Getting Detail Data Room Rules",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Detail Room Rules",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      rules,
	}
}
