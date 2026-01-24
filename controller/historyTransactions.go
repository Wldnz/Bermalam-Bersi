package controller

import (
	"database/sql"

	"bersi.bermalam.id/config"
)

type ResponseResultHistoryTransaction struct {
	Message      string                     `json:"message"`
	ErrorMessage string                     `json:"error_message"`
	Category     string                     `json:"category"`
	IsSuccess    bool                       `json:"is_success"`
	Data         []ResultHistoryTransaction `json:"data"`
}

type ResponseDetailResultHistoryTransaction struct {
	Message      string                      `json:"message"`
	ErrorMessage string                      `json:"error_message"`
	Category     string                      `json:"category"`
	IsSuccess    bool                        `json:"is_success"`
	Data         ResultDetailTransactionData `json:"data"`
}

type ResultHistoryTransactionHotel struct {
	Name      string                                  `json:"name"`
	ImageURL  string                                  `json:"image_url"`
	Address1  string                                  `json:"address_1"`
	Latitude  string                                  `json:"latitude"`
	Longitude string                                  `json:"longitude"`
	Rooms     []ResultHistoryTransactionHotelTypeRoom `json:"rooms"`
}

type ResultHistoryTransactionHotelTypeRoom struct {
	Name       string `json:"name"`
	TotalRooms int    `json:"total_rooms"`
}

type ResultHistoryTransaction struct {
	ID         int                           `json:"id"`
	Status     string                        `json:"status"`
	Category   string                        `json:"category"`
	TotalPrice string                        `json:"total_price"`
	Hotel      ResultHistoryTransactionHotel `json:"hotel"`
	CheckInAt  string                        `json:"check_in_at"`
	CheckOutAt string                        `json:"check_out_at"`
	CreatedAt  string                        `json:"created_at"`
}

type ResultDetailTransactionData struct {
	Transaction ResultTransactionData      `json:"transaction"`
	Hotel       ResultTransactionHotel     `json:"hotel"`
	Bookings    []ResultTransactionBooking `json:"bookings"`
	Voucher     ResultTransactionVoucer    `json:"voucher"`
}

type ResultTransactionData struct {
	ID           int    `json:"id"`
	TotalPrice   string `json:"total_price"`
	TotalRooms   int    `json:"total_rooms"`
	TaxCost      string `json:"tax_cost"`
	Adults       int    `json:"total_adults"`
	Childrens    int    `json:"total_childrens"`
	CheckInAt    string `json:"check_in_at"`
	CheckOutAt   string `json:"check_out_at"`
	Category     string `json:"category"`
	Level        string `json:"level"`
	PaymentType  string `json:"payment_type"`
	PaymentLink  string `json:"payment_link"`
	Status       string `json:"status"`
	ExpiredAt    string `json:"expired_at"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
	HasVoucher   bool   `json:"has_voucher"`
	IsRefundable bool   `json:"is_refundable"`
}

type ResultTransactionVoucerRaw struct {
	ID               sql.NullInt64
	UserVoucherID    sql.NullInt64
	TotalPriceReduce sql.NullString
}

type ResultTransactionVoucer struct {
	ID               int    `json:"id"`
	UserVoucherID    int    `json:"id_user_voucher"`
	TotalPriceReduce string `json:"total_price_reduce"`
}

type ResultTransactionBooking struct {
	ID               int    `json:"id"`
	TypeRoomID       int    `json:"id_type_room"`
	PersonName       string `json:"person_name"`
	PhoneCountryCode string `json:"phone_country_code"`
	Phone            string `json:"phone"`
	HasWhastApp      bool   `json:"hasWhastApp"`
	Status           string `json:"status"`
	Note             string `json:"note"`
	CheckInAt        string `json:"check_in_at"`
	CheckOutAt       string `json:"check_out_at"`
}

type ResultTransactionHotel struct {
	ID                    int                       `json:"id"`
	Name                  string                    `json:"name"`
	Email                 string                    `json:"email"`
	Phone                 string                    `json:"phone"`
	OperationalCheckInAt  string                    `json:"operational_check_in_at"`
	OperationalCheckOutAt string                    `json:"operational_check_out_at"`
	Room                  ResultTransactionTypeRoom `json:"room"`
}

type ResultTransactionTypeRoom struct {
	Name            string `json:"name"`
	FreeCancel      bool   `json:"free_cancel"`
	HowLongToCancel string `json:"how_long_to_cancel"`
	Refundable      bool   `json:"refundable"`
}

func GetHistoryTransactions(user_id int, currentIndex int) ResponseResultHistoryTransaction {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseResultHistoryTransaction{
			Message:      "There's Something Error When Connectting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	query := `SELECT t.id, t.status, t.category, t.check_in, t.check_out, t.total_price, t.created_at ,
				h.name AS hotel_name, h.url AS image_url, h.address_1, h.latitude, h.longitude
				FROM transactions t
				INNER JOIN booking b ON b.id_transaction = t.id
				INNER JOIN hotel_type_rooms htr ON htr.id = b.id_type_room 
				LEFT JOIN (
					SELECT h.id, h.name, hi.url, hl.address_1, hl.latitude, hl.longitude FROM hotels h
					LEFT JOIN hotel_images hi ON hi.id_hotel = h.id AND hi.isPinned = 1
					LEFT JOIN hotel_location hl ON hl.id_hotel = h.id
				) h ON h.id = htr.id_hotel
				WHERE id_user = ?
				GROUP BY t.id, b.id_type_room, htr.id, h.id, h.url, h.address_1, h.latitude, h.longitude
				LIMIT 5 OFFSET ?;`

	currentOffset := (currentIndex - 1) * 5
	rows, err := db.Query(query, user_id, currentOffset)

	if err != nil {
		return ResponseResultHistoryTransaction{
			Message:      "There's Something Error When Getting History Transactions",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer rows.Close()

	historyTransactions := []ResultHistoryTransaction{}

	for rows.Next() {

		var transaction ResultHistoryTransaction

		if err = rows.Scan(&transaction.ID, &transaction.Status, &transaction.Category, &transaction.CheckInAt, &transaction.CheckOutAt, &transaction.TotalPrice, &transaction.CreatedAt, &transaction.Hotel.Name, &transaction.Hotel.ImageURL, &transaction.Hotel.Address1, &transaction.Hotel.Latitude, &transaction.Hotel.Longitude); err != nil {
			return ResponseResultHistoryTransaction{
				Message:      "There's Something Error When Getting History Transactions Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

		historyTransactions = append(historyTransactions, transaction)
	}

	if len(historyTransactions) == 0 {
		return ResponseResultHistoryTransaction{
			Message:   "Sorry We Cannot Found History Transaction",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	for index, history := range historyTransactions {

		rooms := []ResultHistoryTransactionHotelTypeRoom{}

		query = `SELECT  htr.name, COUNT(b.id_type_room) FROM booking b
		INNER JOIN hotel_type_rooms htr ON htr.id = b.id_type_room
		WHERE b.id_transaction=?
		GROUP BY b.id_type_room, htr.id;`

		rows, err = db.Query(query, history.ID)

		if err != nil {
			return ResponseResultHistoryTransaction{
				Message:      "There's Something Error When Getting Ordered Rooms!",
				Category:     "ERROR",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}

		for rows.Next() {

			var room ResultHistoryTransactionHotelTypeRoom

			if err = rows.Scan(&room.Name, &room.TotalRooms); err != nil {
				return ResponseResultHistoryTransaction{
					Message:      "There's Something Error When Scanning Ordered Rooms!",
					Category:     "ERROR",
					ErrorMessage: err.Error(),
					IsSuccess:    false,
				}
			}
			rooms = append(rooms, room)
		}
		rows.Close()
		historyTransactions[index].Hotel.Rooms = rooms
	}

	return ResponseResultHistoryTransaction{
		Message:   "Succesfully Getting Data History Transaction! ...",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      historyTransactions,
	}

}

func GetDetailHistoryTransaction(id_user int, transaction_id string) ResponseDetailResultHistoryTransaction {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseDetailResultHistoryTransaction{
			Message:      "There's Something Error When Connectting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var transaction ResultTransactionData
	var transactionVoucherRaw ResultTransactionVoucerRaw

	query := `SELECT 
				t.id AS transaction_id, t.total_price, t.tax_cost, t.total_rooms, t.adult, t.children, t.check_in, t.check_out, t.category, t.level, COALESCE(t.payment_type, ""), t.payment_link, t.status, t.expired_at, t.created_at, t.updated_at,
				tv.id AS transaction_voucher_id, tv.id_user_voucher AS user_voucher_id, tv.total_price_reduction
			FROM transactions t
			LEFT JOIN transaction_vouchers tv ON tv.id_transaction = t.id
			WHERE t.id=? AND t.id_user=?`

	// raw data.... bisa kena nullString... dibagian voucher.....
	if err = db.QueryRow(query, transaction_id, id_user).Scan(
		&transaction.ID, &transaction.TotalPrice, &transaction.TaxCost, &transaction.TotalRooms, &transaction.Adults, &transaction.Childrens, &transaction.CheckInAt, &transaction.CheckOutAt, &transaction.Category, &transaction.Level, &transaction.PaymentType, &transaction.PaymentLink, &transaction.Status, &transaction.ExpiredAt, &transaction.CreatedAt, &transaction.UpdatedAt,
		&transactionVoucherRaw.ID, &transactionVoucherRaw.UserVoucherID, &transactionVoucherRaw.TotalPriceReduce,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseDetailResultHistoryTransaction{
				Message:      "Sorry We Cannot Found The Transaction Detail",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseDetailResultHistoryTransaction{
				Message:      "There's Something Error When Getting TransactionData",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	var transactionVoucher ResultTransactionVoucer

	if transactionVoucherRaw.ID.Valid {
		transactionVoucher.ID = int(transactionVoucherRaw.ID.Int64)
		transactionVoucher.UserVoucherID = int(transactionVoucherRaw.UserVoucherID.Int64)
		transactionVoucher.TotalPriceReduce = transactionVoucherRaw.TotalPriceReduce.String
		transaction.HasVoucher = true
	}

	bookings := []ResultTransactionBooking{}

	query = `SELECT id, id_type_room, person_name, phone_country_code, phone, hasWhatsApp, status, check_in_at, 
		check_out_at, note FROM booking 
			WHERE id_transaction = ?`

	rows, err := db.Query(query, transaction.ID)

	if err != nil {
		return ResponseDetailResultHistoryTransaction{
			Message:      "There's Something Error When Getting Booking Data",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	for rows.Next() {
		var booking ResultTransactionBooking

		if err = rows.Scan(&booking.ID, &booking.TypeRoomID, &booking.PersonName, &booking.PhoneCountryCode, &booking.Phone, &booking.HasWhastApp, &booking.Status, &booking.CheckInAt, &booking.CheckOutAt, &booking.Note); err != nil {
			return ResponseDetailResultHistoryTransaction{
				Message:      "There's Something Error When Getting Scanning Booking Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

		bookings = append(bookings, booking)
	}

	defer rows.Close()

	if len(bookings) == 0 {
		return ResponseDetailResultHistoryTransaction{
			Message:   "Sorry.. We Cannot Found Any Booking Data...",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	var hotel_id int

	query = `SELECT h.id FROM hotels h
				INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
				WHERE htr.id=?`

	if err = db.QueryRow(query, bookings[0].TypeRoomID).Scan(&hotel_id); err != nil {
		if err == sql.ErrNoRows {
			return ResponseDetailResultHistoryTransaction{
				Message:      "Sorry.. We Cannot Found The Hotel ID",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseDetailResultHistoryTransaction{
				Message:      "There's Something Error When Getting Scanning Hotel ID",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	var hotel ResultTransactionHotel

	query = `SELECT 
			h.id, h.name, h.email, h.phone, h.operational_check_in_at, h.operational_check_out_at,
			htrr.name, htrr.free_cancel, htrr.how_long_to_cancel, htrr.refundable
		FROM hotels h
		LEFT JOIN (
			SELECT id_hotel, GROUP_CONCAT(SUBSTRING_INDEX(name, ',', 1) SEPARATOR ', ') AS name,
			MIN(free_cancel) AS free_cancel, MIN(how_long_to_cancel) AS how_long_to_cancel, MIN(refundable) AS refundable FROM hotel_type_rooms
			GROUP BY id_hotel
		) htrr ON htrr.id_hotel = h.id
		WHERE h.id=?;`

	if err = db.QueryRow(query, hotel_id).Scan(
		&hotel.ID, &hotel.Name, &hotel.Email, &hotel.Phone, &hotel.OperationalCheckInAt, &hotel.OperationalCheckOutAt,
		&hotel.Room.Name, &hotel.Room.FreeCancel, &hotel.Room.HowLongToCancel, &hotel.Room.Refundable,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseDetailResultHistoryTransaction{
				Message:      "Sorry, We Cannot Found The Hotel Data...",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseDetailResultHistoryTransaction{
				Message:      "There's Something Error When Getting Scanning Hotel Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseDetailResultHistoryTransaction{
		Message:  "Succesfully Getting Data...",
		Category: "SUCCESS",
		Data: ResultDetailTransactionData{
			Transaction: transaction,
			Hotel:       hotel,
			Bookings:    bookings,
			Voucher:     transactionVoucher,
		},
		IsSuccess: true,
	}

}
