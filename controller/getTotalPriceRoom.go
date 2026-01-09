package controller

import (
	"database/sql"
	"fmt"

	"bersi.bermalam.id/config"
)

type GuestInformationData struct {
	FullName         string `json:"full_name"`
	PhoneCountryCode string `json:"phone_country_code"`
	Phone            string `json:"phone"`
	HasWhastApp      bool   `json:"hasWhastApp"`
	Note             string `json:"note"`
}

type RequestRoomBookingData struct {
	ID       int    `json:"id_type_room"`
	Name     string `json:"name"`
	Quantity int    `json:"quantity"`
	Guests   []GuestInformationData
}

type ResultCheckPriceRoom struct {
	DefaultPrice int
	MinimumPrice int
	TotalRooms   int
}

type ResultPriceTypeRooms struct {
	ID         int
	TotalPrice int
	Guests     []GuestInformationData
}

type ResponseCheckTotalPrice struct {
	Message      string
	ErrorMessage string
	Category     string
	IsSuccess    bool
	TotalPrice   int
	PriceRooms   []ResultPriceTypeRooms
}

func GetTotalPriceRoom(
	rooms []RequestRoomBookingData,
	level_transaction string,
) ResponseCheckTotalPrice {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseCheckTotalPrice{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	type_price := `CAST(MIN(htrdp.price_per_night) AS SIGNED)`
	type_price_2 := `CAST(COALESCE(MIN(htrdp_2.price_per_night), 0) AS SIGNED)`

	switch level_transaction {
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

	totalPrices := 0

	priceRooms := []ResultPriceTypeRooms{}

	for _, room := range rooms {

		var data ResultCheckPriceRoom

		query := fmt.Sprintf(`SELECT
					%s AS default_price, %s AS minimum_price, COUNT(DISTINCT hr.id) as total_rooms
				FROM hotel_type_rooms htr
				INNER JOIN hotel_type_room_price_period htrpp ON htrpp.id_type_room = htr.id AND htrpp.default=1
				INNER JOIN hotel_type_room_dynamic_price htrdp ON htrdp.id_price_period = htrpp.id
				LEFT JOIN hotel_type_room_price_period htrpp_2 ON htrpp_2.id_type_room = htr.id AND htrpp_2.default=0
				LEFT JOIN hotel_type_room_dynamic_price htrdp_2 ON htrdp_2.id_price_period = htrpp_2.id
				LEFT JOIN hotel_rooms hr ON hr.id_type_room = htr.id AND hr.status = 'available'
				WHERE htr.id=?
				GROUP BY htr.id
				HAVING total_rooms >= ?`, type_price, type_price_2)

		if err = db.QueryRow(query, room.ID, room.Quantity).Scan(&data.DefaultPrice, &data.MinimumPrice, &data.TotalRooms); err != nil {
			if err == sql.ErrNoRows {
				return ResponseCheckTotalPrice{
					Message:      "Cannot Found Rooms Or The Quantity Is Over The Stock Room",
					ErrorMessage: err.Error(),
					Category:     "NOT_FOUND",
					IsSuccess:    false,
				}
			} else {
				return ResponseCheckTotalPrice{
					Message:      "There's Something Error When Getting Total Price...",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				}
			}
		}

		price := 0

		if data.MinimumPrice != 0 {
			price = data.MinimumPrice * room.Quantity
		} else {
			price = data.DefaultPrice * room.Quantity
		}

		totalPrices += price

		priceRooms = append(priceRooms, ResultPriceTypeRooms{
			ID:         room.ID,
			TotalPrice: price / room.Quantity,
			Guests:     room.Guests,
		})
	}

	return ResponseCheckTotalPrice{
		Message:    "Getting Total Price Is Succesfully",
		IsSuccess:  true,
		TotalPrice: totalPrices,
		PriceRooms: priceRooms,
	}

}
