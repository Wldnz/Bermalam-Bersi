package admin_management_rooms

import (
	"database/sql"
	"fmt"
	"net/http"

	"bersi.bermalam.id/config"
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

	var response ResponseMenuTypeRoom

	switch menu {
	case "period":
		data := periodPricesTypeRoom(type_room_id)
		response = data
	case "detail-period":
		data := detailPeriodPrice(id)
		response = data
	default:
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

func periodPricesTypeRoom(type_room_id string) ResponseMenuTypeRoom {

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

	var data []ResultPeriodPrice

	rows, err := db.Query(`SELECT p.id, p.name, p.start_at, p.end_at, p.status, p.default   FROM hotel_type_room_price_period p WHERE id_type_room=?`, type_room_id)

	if err != nil {
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

	defer rows.Close()

	for rows.Next() {
		var period ResultPeriodPrice
		if err = rows.Scan(
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
				fmt.Println(price)
				data[key].Prices = append(value.Prices, price)
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

	var data []ResultPeriodPrice

	rows, err := db.Query(`SELECT p.id, p.name, p.start_at, p.end_at, p.status, p.default   FROM hotel_type_room_price_period p WHERE id=?`, period_id)

	if err != nil {
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

	defer rows.Close()

	for rows.Next() {
		var period ResultPeriodPrice
		if err = rows.Scan(
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

	for key, value := range data {

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
			fmt.Println(price)
			data[key].Prices = append(value.Prices, price)
		}
	}

	return ResponseMenuTypeRoom{
		Message:   "Succesfully Getting Data Period Price",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

// func rooms(type_room_id string) ResponseMenuTypeRoom {}

// func facilitesTypeRoom(type_room_id string) ResponseMenuTypeRoom {}

// func benefitTypeRoom(type_room_id string) ResponseMenuTypeRoom {}

// func rulesTypeRoom(type_room_id string) ResponseMenuTypeRoom {}
