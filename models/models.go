package models

import "database/sql"

type ResponseMessage struct {
	Message    string      `json:"message"`
	Error      string      `json:"error"`
	Data       interface{} `json:"data"`
	StatusCode int         `json:"status_code"`
}

type SenderEmailNeeded struct {
	Subject string
	Message string
	To      []string
	Cc      []string
}

type ResultUserAddress struct {
	ID        sql.NullInt16  `json:"id"`
	Address   sql.NullString `json:"address"`
	Country   sql.NullString `json:"country"`
	City      sql.NullString `json:"city"`
	ZipCode   sql.NullString `json:"zip_code"`
	CreatedAt sql.NullInt64  `json:"created_at"`
	UpdatedAt sql.NullInt64  `json:"updated_at"`
	CreatedBy sql.NullInt16  `json:"created_by"`
	UpdatedBy sql.NullInt16  `json:"updated_by"`
}

type ResultUserIdentifaction struct {
	ID          sql.NullInt16  `json:"id"`
	DocumentURL sql.NullString `json:"document_url"`
	Status      sql.NullString `json:"status"`
	Reason      sql.NullString `json:"reason"`
	CreatedAt   sql.NullInt64  `json:"created_at"`
	UpdatedAt   sql.NullInt64  `json:"updated_at"`
	CreatedBy   sql.NullInt16  `json:"created_by"`
	UpdatedBy   sql.NullInt16  `json:"updated_by"`
}

type ResultUserImages struct {
	ID        sql.NullInt16  `json:"id"`
	Url       sql.NullString `json:"url"`
	CreatedAt sql.NullInt64  `json:"created_at"`
	UpdatedAt sql.NullInt64  `json:"updated_at"`
	CreatedBy sql.NullInt64  `json:"created_by"`
	UpdatedBy sql.NullInt64  `json:"updated_by"`
}

type ResultDetailAccount struct {
	ID               int           `json:"id"`
	FirstName        string        `json:"first_name"`
	LastName         string        `json:"last_name"`
	Email            string        `json:"email"`
	PhoneCountryCode string        `json:"phone_country_code"`
	Phone            string        `json:"phone"`
	Role             string        `json:"role"`
	Status           string        `json:"status"`
	Verified         int           `json:"verified"`
	VerifiedAt       sql.NullInt64 `json:"verified_at"`
	CreatedAt        sql.NullInt64 `json:"created_at"`
	UpdatedAt        sql.NullInt64 `json:"updated_at"`
}

type ResponseMessageStorage struct {
	Message      string
	ErrorMessage string
	Category     string
	IsSuccess    bool
	URL          string
}
