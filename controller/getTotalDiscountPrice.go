package controller

import (
	"database/sql"
	"time"

	"bersi.bermalam.id/config"
)

type ResultGetTotalDiscountPrice struct {
	Message            string `json:"message"`
	ErrorMessage       string
	Category           string
	IsSuccess          bool
	TotalDiscountPrice int
}

type ResultVoucherPrice struct {
	ID       int
	Category string
	Cashback int
	Discount float64
}

func GetTotalDiscountPrice(
	totalPrice int,
	user_id int,
	user_voucher_id int,
) ResultGetTotalDiscountPrice {

	if user_voucher_id == 0 {
		return ResultGetTotalDiscountPrice{
			Message:            "Succesfully Getting Discount Price",
			Category:           "SUCCESS",
			IsSuccess:          true,
			TotalDiscountPrice: 0,
		}
	}

	currentTime := time.Now()
	currentTimeMili := currentTime.Unix()

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResultGetTotalDiscountPrice{
			Message:      "There's Something Error When Conneting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	query := `SELECT uv.id, v.category, v.cashback, v.discount
			FROM user_vouchers uv
		INNER JOIN vouchers v ON v.id = uv.id_voucher AND v.permisson = 1
			#cari yang masih aktif dari expired dan statusnya
			WHERE uv.status = 'active' AND uv.id_user = ? AND uv.id = ?
			AND uv.expired_at >=?`

	var resultVoucher ResultVoucherPrice

	if err = db.QueryRow(query, user_id, user_voucher_id, currentTimeMili).Scan(&resultVoucher.ID, &resultVoucher.Category, &resultVoucher.Cashback, &resultVoucher.Discount); err != nil {
		if err == sql.ErrNoRows {
			return ResultGetTotalDiscountPrice{
				Message:      "Sorry We Cannot Found The Voucher...",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResultGetTotalDiscountPrice{
				Message:      "There's Something Error When Conneting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	discountPrice := 0

	switch resultVoucher.Category {
	case "discount":
		discountPrice = (totalPrice / 100) * (int(resultVoucher.Discount))
	case "cashback":
		discountPrice = resultVoucher.Cashback
	}

	return ResultGetTotalDiscountPrice{
		Message:            "Succesfully Getting Discount Price",
		Category:           "SUCCESS",
		IsSuccess:          true,
		TotalDiscountPrice: discountPrice,
	}

}
