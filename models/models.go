package models

type ResponseMessage struct {
	Message    string      `json:"message"`
	Error      error       `json:"error"`
	Data       interface{} `json:"data"`
	StatusCode int         `json:"status_code"`
}
