package models

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
