package controller

import (
	"time"

	"bersi.bermalam.id/config"
)

type ResponseCreateTransaction struct {
	Message      string
	ErrorMessage string
	Category     string
	IsSuccess    bool
}

func CreateTransaction(
	user_id int,
	total_price int,
	total_rooms int,
	adult int,
	children int,
	check_in_at int,
	check_out_at int,
	category_transaction string,
	level string,
	payment_link string,
	user_voucher_id int,
	total_price_reduction int,
	invoice_number string,
	roomPrices []ResultPriceTypeRooms,
) ResponseCreateTransaction {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	tx, err := db.Begin()

	if err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Want Begin Insert",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer tx.Rollback()

	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	queryBooking := `INSERT INTO transactions(id_user, total_price, tax_cost, total_rooms, adult, children, check_in, check_out, category, level, payment_link, expired_at, created_at, updated_at, created_by, updated_by) 
		VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ) 
	`

	res, err := tx.Exec(queryBooking,
		user_id,
		total_price,
		3000,
		total_rooms,
		adult,
		children,
		check_in_at,
		check_out_at,
		category_transaction,
		level,
		payment_link,
		(60*60*12*1000)+currentTimeMili,
		currentTimeMili,
		currentTimeMili,
		user_id,
		user_id,
	)

	if err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Want Want To Create Transaction",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	lastInsertId, err := res.LastInsertId()

	if err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Want Want To Check Current Transaction ID",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	queryBooking = `INSERT INTO booking(id_transaction, id_type_room, price, check_in_at, check_out_at, note, person_name, phone, phone_country_code, hasWhatsApp, created_at, updated_at, created_by, updated_by)
		VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
	`

	for _, room := range roomPrices {
		for _, guest := range room.Guests {
			_, err := tx.Exec(queryBooking,
				lastInsertId, room.ID, room.TotalPrice, check_in_at, check_out_at, guest.Note, guest.FullName, guest.Phone, guest.PhoneCountryCode, guest.HasWhastApp, currentTimeMili, currentTimeMili, user_id, user_id,
			)
			if err != nil {
				return ResponseCreateTransaction{
					Message:      "There's Something Error When Want Want To Create Booking",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				}
			}
		}
	}

	// next i should adding transaction_doku_informations, it's important btw

	queryHotelInformations := `INSERT INTO transaction_doku_informations(id_transaction, invoice_id, payment_link, category, created_at, updated_at, created_by, updated_by)
	VALUES( ?, ?, ?, ?, ?, ?, ?, ? )`

	res, err = tx.Exec(queryHotelInformations,
		lastInsertId,
		invoice_number,
		payment_link,
		category_transaction,
		currentTimeMili,
		currentTimeMili,
		user_id,
		user_id,
	)

	if err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Want Want To Invoice Number Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	if user_voucher_id != 0 {

		queryVoucher := `INSERT INTO transaction_vouchers( id_user_voucher, id_transaction, total_price_reduction, created_at, updated_at, created_by, updated_by )
	VALUES ( ?, ?, ?, ?, ?, ?, ? )`

		res, err = tx.Exec(queryVoucher,
			user_voucher_id,
			lastInsertId,
			total_price_reduction,
			currentTimeMili,
			currentTimeMili,
			user_id,
			user_id,
		)

		if err != nil {
			return ResponseCreateTransaction{
				Message:      "There's Something Error When Want Want To Store History Used Voucher..",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

		queryVoucher = `UPDATE user_vouchers SET status='inactive', updated_at=? WHERE id =?`

		res, err = tx.Exec(queryVoucher, currentTimeMili, user_voucher_id)

		if err != nil {
			return ResponseCreateTransaction{
				Message:      "There's Something Error When Want To Updating Status Voucher Into Inactive",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return ResponseCreateTransaction{
			Message:      "There's Something Error When Want Want Commit Transaction",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	// i forgot to change the status room into booked...., need pay first btw i forgot...

	return ResponseCreateTransaction{
		Message:   "Succesfully Create Transaction!",
		Category:  "SUCCESS",
		IsSuccess: true,
	}

}

func BookingTransaction() {}
