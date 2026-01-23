package controller

import "bersi.bermalam.id/config"

type ResponseUpdateAccountInformationTransaction struct {
	Message      string
	ErrorMessage string
	IsSuccess    bool
}

func UpdateAccountInformationTransaction(
	credentials ResponseCrendtialsAccount,
	firstName string,
	lastName string,
	phone_country_code string,
	phone string,
) ResponseUpdateAccountInformationTransaction {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseUpdateAccountInformationTransaction{
			Message:      "There's Something Error Connecting Into Database",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
		}
	}

	defer db.Close()

	_, err = db.Exec(`UPDATE users SET first_name = ?, last_name = ?, phone_country_code = ?, phone = ? WHERE id = ?`,
		firstName,
		lastName,
		phone_country_code,
		phone,
		credentials.User.ID,
	)

	if err != nil {
		return ResponseUpdateAccountInformationTransaction{
			Message:      "There's Something Error When Updating Account Information",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
		}
	}

	return ResponseUpdateAccountInformationTransaction{
		Message:   "Succesfully Updting Information Account!",
		IsSuccess: true,
	}

}
