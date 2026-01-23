package auth

type ResultUser struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	Role      string `json:"role"`
	Verified  int    `json:"verified"`
	Password  string `json:"password"`
	Status    string `json:"status"`
}

type TokenSession struct {
	ID         int    `json:"id"`
	UserID     int    `json:"id_user"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
	CodeOTP    string `json:"code_otp"`
	Token      string `json:"token"`
	Active     int    `json:"active"`
	ExpiredAt  int64  `json:"expired_at"`
	IsRemember bool   `json:"is_remember"`
}

type LoginData struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	IsRemember bool   `json:"is_remember"`
	Role       string `json:"role"`
}

type ResultCheckingToken struct {
	ID     int    `json:"id"`
	UserID int    `json:"id_user"`
	Token  string `json:"token"`
}

type RequestVerificationOTP struct {
	CodeOTP int `json:"code_otp"`
}

type RegisterMitrAccount struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	PhoneCode int    `json:"phone_country_code"`
	Phone     string `json:"phone"`
	Password  string `json:"password"`
}

type RegisterGuestAccount struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}
