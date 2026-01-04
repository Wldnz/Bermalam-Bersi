package admin_management_hotel

import (
	"database/sql"
	"fmt"
	"net/http"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResponseMenuHotel struct {
	Message      string
	ErrorMessage string
	Category     string
	Data         interface{}
	IsSuccess    bool
}

type ResultHotelImage struct {
	ID       int    `json:"id"`
	URL      string `json:"url"`
	IsPinned bool   `json:"is_pinned"`
}

type ResponseHotelAPI struct {
	Message   string `json:"message"`
	Error     string `json:"error"`
	Data      any    `json:"data"`
	IsSuccess bool
}

type ResultGeneralHotel struct {
	ID                  int    `json:"id"`
	Name                string `json:"name"`
	Description         string `json:"description"`
	Type                string `json:"type"`
	Phone               string `json:"phone"`
	Email               string `json:"email"`
	Stars               string `json:"stars"`
	OperationalCheckIn  string `json:"operational_check_in"`
	OperationalCheckOut string `json:"operational_check_out"`
	CreatedAt           string `json:"created_at"`
	UpdatedAt           string `json:"updated_at"`
	CreatedBy           string `json:"created_by"`
	UpdatedBy           string `json:"updated_by"`
	Images              []ResultHotelImage
}

type ResultPersonalHotelDataRaw struct {
	Name string `json:"name"`

	// detail_hotel
	DetailHotelID      sql.NullString `json:"detail_hotel_id"`
	NPWP               sql.NullString `json:"npwp"`
	BankName           sql.NullString `json:"bank_name"`
	BankAccount        sql.NullString `json:"bank_account"`
	BankAccountOwnedBy sql.NullString `json:"bank_account_owned_by"`
	StatusHotel        sql.NullString `json:"status_hotel"`

	// operational
	HotelOperationalID     sql.NullString `json:"hotel_operational_id"`
	PositionCharge         sql.NullString `json:"position_charge"`
	ReasonUsing            sql.NullString `json:"reason_using"`
	HaveExperience         sql.NullInt32  `json:"have_experience"`
	PreviousManageIsAlone  sql.NullInt32  `json:"previous_manage_is_alone"`
	AcceptFreeCancelled    sql.NullInt32  `json:"accept_free_cancelled"`
	HowLongAcceptCancelled sql.NullInt64  `json:"how_long_accept_cancelled"`
	AcceptRefund           sql.NullInt32  `json:"accept_refund"`
	RequirementRefund      sql.NullString `json:"requirement_refund"`

	// hotel_document
	HotelDocumentID  sql.NullString `json:"hotel_document_id"`
	DocumentURL      sql.NullString `json:"document_url"`
	ReasonDocument   sql.NullString `json:"document_reason"`
	DocumentVerified sql.NullInt32  `json:"document_verified"`
	DocumentStatus   sql.NullString `json:"document_status"`

	// if the table has data
	HasOperational int `json:"has_operational"`
	HasDocument    int `json:"has_document"`
	HasDetail      int `json:"has_detail"`
}

type ResultPersonalHotelOperation struct {
	ID                     string `json:"id"`
	PositionCharge         string `json:"position_charge"`
	ReasonUsing            string `json:"reason_using"`
	HaveExperience         int    `json:"have_experience"`
	PreviousManageIsAlone  int    `json:"previous_manage_is_alone"`
	AcceptFreeCancelled    int    `json:"accept_free_cancelled"`
	HowLongAcceptCancelled int64  `json:"how_long_accept_cancelled"`
	AcceptRefund           int    `json:"accept_refund"`
	RequirementRefund      string `json:"requirement_refund"`
}

type ResultPersonalHotelDetailData struct {
	ID                 string `json:"id"`
	NPWP               string `json:"npwp"`
	BankName           string `json:"bank_name"`
	BankAccount        string `json:"bank_account"`
	BankAccountOwnedBy string `json:"bank_account_owned_by"`
	StatusHotel        string `json:"status"`
}

type ResultPersonalHotelDocument struct {
	ID               string `json:"id"`
	DocumentURL      string `json:"url"`
	ReasonDocument   string `json:"reason"`
	DocumentVerified int    `json:"verified"`
	DocumentStatus   string `json:"status"`
}

type ResultPersonalHotelData struct {
	Name string `json:"name"`

	Operational any `json:"operation"`

	// detail_hotel
	Detail any `json:"detail"`

	// hotel_document
	Document any `json:"document"`

	// if the table has data
	HasOperational bool `json:"has_operational"`
	HasDocument    bool `json:"has_document"`
	HasDetail      bool `json:"has_detail"`
}

type ResultTypeRoomHotel struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	RoomSize   string `json:"room_size"`
	BedType    string `json:"bed_type"`
	TotalRooms int    `json:"total_rooms"`
}

type ResultTypeRoomImages struct {
	ID  int    `json:"id"`
	URL string `json:"url"`
}

type ResultDetailTypeRooms struct {
	ID              int    `json:"id"`
	Name            string `json:"name"`
	Description     string `json:"description"`
	FreeCancel      int    `json:"is_free_cancel"`
	HowLongToCancel int32  `json:"how_long_to_cancel"`
	Refundable      int32  `json:"is_refundable"`
	RoomSize        string `json:"room_size"`
	BedType         string `json:"bed_type"`
	MaxAdult        int    `json:"max_adult"`
	MaxChildren     int    `json:"max_children"`
	Images          any
	// CreatedAt int64 `json:"created_at"`
	// UpdatedAt int64 `json:"updated_at"`
	// CreatedBy int `json:"created_by"`
	// UpdatedBy int `json:"updated_by"`
}

func DetailHotel(c *gin.Context) {

	hotel_id := c.Param("id")

	if hotel_id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"Message":     "Make Sure To Bring The ID!",
			"status_code": http.StatusBadRequest,
		})
		return
	}

	menu := c.DefaultQuery("tab_menu", "general")

	var response ResponseMenuHotel

	// general, personal, type-rooms, detail-room, facilities, location, feedback, stats

	switch menu {
	case "general":
		data := generalInformation(hotel_id)
		response = data
	case "personal":
		data := personalInformation(hotel_id)
		response = data
	case "type-rooms":
		data := typeRooms(hotel_id)
		response = data
	case "detail-room":
		data := detailTypeRoom(c.DefaultQuery("id_type_room", "0"))
		response = data
	case "facilities":
	case "location":
	case "feedback":
	case "stats":
	default:
		c.JSON(http.StatusBadGateway, gin.H{
			"message":     fmt.Sprintf("Sorry, We Cannot Process menu %s", menu),
			"status_code": http.StatusBadGateway,
		})
		return
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

// hotels dan hotel_images
func generalInformation(hotel_id string) ResponseMenuHotel {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var data ResultGeneralHotel

	if err = db.QueryRow(`SELECT 
			id, name, description, email, phone, property_type,
				operational_check_in_at, operational_check_out_at, stars, created_at, updated_at, created_by, updated_by
				FROM hotels
					WHERE id=?
	`, hotel_id).Scan(
		&data.ID, &data.Name, &data.Description, &data.Email, &data.Phone, &data.Type,
		&data.OperationalCheckIn, &data.OperationalCheckOut, &data.Stars,
		&data.CreatedAt, &data.UpdatedAt, &data.CreatedBy, &data.UpdatedBy,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Sorry, We Cannot Found The Data...",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting General Information From Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	// mendapatkan data untuk hotel images (semangat - semangat!!!!!!!!!!!!)

	rows, err := db.Query(`SELECT id, url, isPinned FROM hotel_images WHERE id_hotel=?`, hotel_id)

	if err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Sorry, We Cannot Found The Images...",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				Data:         data,
				IsSuccess:    true,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Hotel Images From Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}

	}

	defer rows.Close()

	for rows.Next() {
		var image ResultHotelImage

		if err = rows.Scan(&image.ID, &image.URL, &image.IsPinned); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Hotel Images From Query",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		data.Images = append(data.Images, image)
	}

	return ResponseMenuHotel{
		Message:   "Succesffully Getting General Information & Hotel Images!",
		IsSuccess: true,
		Category:  "SUCCESS",
		Data:      data,
	}

}

func personalInformation(hotel_id string) ResponseMenuHotel {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	query := `SELECT 
				h.name,
				ho.id AS hotel_operational_id, ho.position_charge, ho.reason_using, ho.haveExperience, ho.previousManageIsAlone, ho.acceptFreeCancelled, ho.howLongAcceptCancelled, ho.acceptRefund, ho.requirement_refund,
				dh.id AS detail_hotel_id, dh.npwp_number AS npwp, dh.bank_name, dh.bank_account, dh.bank_account_owned_by, dh.status AS status_detail,
				hd.id AS hotel_document_id, hd.document_url, hd.reason, hd.verified, hd.status as status_document,
				IF(ho.id IS NULL, 0, 1) AS has_operational,
				IF(hd.id IS NULL, 0, 1) AS has_documents,
				IF(dh.id IS NULL, 0, 1) AS has_detail
			FROM hotels h 
			LEFT JOIN hotel_operational ho ON ho.id_hotel = h.id
			LEFT JOIN hotel_documents hd ON hd.id_hotel = h.id
			LEFT JOIN detail_hotel dh ON dh.id_hotel = h.id 
			WHERE h.id=?`

	var data ResultPersonalHotelDataRaw

	if err = db.QueryRow(query, hotel_id).Scan(
		// hotel name
		&data.Name,
		// operational

		&data.HotelOperationalID, &data.PositionCharge, &data.ReasonUsing, &data.HaveExperience, &data.PreviousManageIsAlone, &data.AcceptFreeCancelled, &data.HowLongAcceptCancelled, &data.AcceptRefund, &data.RequirementRefund,

		// detail_hotel
		&data.DetailHotelID, &data.NPWP, &data.BankName, &data.BankAccount, &data.BankAccountOwnedBy, &data.StatusHotel,

		// hotel document
		&data.HotelDocumentID, &data.DocumentURL, &data.ReasonDocument, &data.DocumentVerified, &data.DocumentStatus,

		// check if data is not null
		&data.HasOperational,
		&data.HasDocument,
		&data.HasDetail,
	); err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Scanning Data",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	//
	responseData := &ResultPersonalHotelData{
		Name:           data.Name,
		HasDocument:    false,
		HasDetail:      false,
		HasOperational: false,
	}
	var dataDetailHotel ResultPersonalHotelDetailData
	var dataOperationalHotel ResultPersonalHotelOperation
	var dataDocumentHotel ResultPersonalHotelDocument

	if data.HasDetail == 1 {
		dataDetailHotel.ID = data.DetailHotelID.String
		dataDetailHotel.NPWP = data.NPWP.String
		dataDetailHotel.BankName = data.BankName.String
		dataDetailHotel.BankAccount = data.BankAccount.String
		dataDetailHotel.BankAccountOwnedBy = data.BankAccountOwnedBy.String
		dataDetailHotel.StatusHotel = data.StatusHotel.String

		responseData.Detail = dataDetailHotel
		responseData.HasDetail = true
	}

	if data.HasOperational == 1 {
		dataOperationalHotel.ID = data.HotelOperationalID.String
		dataOperationalHotel.PositionCharge = data.PositionCharge.String
		dataOperationalHotel.ReasonUsing = data.ReasonUsing.String
		dataOperationalHotel.HaveExperience = int(data.HaveExperience.Int32)
		dataOperationalHotel.PreviousManageIsAlone = int(data.PreviousManageIsAlone.Int32)
		dataOperationalHotel.AcceptFreeCancelled = int(data.AcceptFreeCancelled.Int32)
		dataOperationalHotel.HowLongAcceptCancelled = data.HowLongAcceptCancelled.Int64
		dataOperationalHotel.AcceptRefund = int(data.AcceptRefund.Int32)
		dataOperationalHotel.RequirementRefund = data.RequirementRefund.String

		responseData.Operational = dataOperationalHotel
		responseData.HasOperational = true
	}

	if data.HasDocument == 1 {

		dataDocumentHotel.ID = data.HotelDocumentID.String
		dataDocumentHotel.DocumentURL = data.DocumentURL.String
		dataDocumentHotel.ReasonDocument = data.ReasonDocument.String
		dataDocumentHotel.DocumentVerified = int(data.DocumentVerified.Int32)
		dataDocumentHotel.DocumentStatus = data.DocumentStatus.String

		responseData.Document = dataDocumentHotel
		responseData.HasDocument = true
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Personal Data Hotel",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      responseData,
	}

}

// need search_engine ig
func typeRooms(hotel_id string) ResponseMenuHotel {

	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	var typeRooms []ResultTypeRoomHotel

	rows, err := db.Query(`SELECT  htr.id, htr.name, htr.room_size, htr.bed_type, COUNT(DISTINCT hr.id) AS total_rooms
						FROM hotels h
							INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
								INNER JOIN hotel_rooms hr ON hr.id_type_room = htr.id
								WHERE h.id =?
									GROUP BY h.id, htr.id
	`, hotel_id)

	if err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Hotel Doesn't Have Any Rooms!",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Type Rooms",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	defer rows.Close()

	for rows.Next() {
		var typeRoom ResultTypeRoomHotel
		if err = rows.Scan(&typeRoom.ID, &typeRoom.Name, &typeRoom.RoomSize, &typeRoom.BedType, &typeRoom.TotalRooms); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Type Rooms",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		typeRooms = append(typeRooms, typeRoom)
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Data Type Rooms",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      typeRooms,
	}

}

func detailTypeRoom(
	type_room_id string,
) ResponseMenuHotel {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Connecting Into Database",
			ErrorMessage: err.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer db.Close()

	// type_room_images
	// type_rooms
	// tab_menu -> periode_harga, kamar, facilities, keuntungan kamar, peraturan kamar
	var data ResultDetailTypeRooms

	query := `SELECT
			id, name, description, free_cancel, how_long_to_cancel, refundable, room_size, bed_type, max_adult, max_children
		FROM hotel_type_rooms  WHERE id =?`

	if err = db.QueryRow(query, type_room_id).Scan(
		&data.ID, &data.Name, &data.Description, &data.FreeCancel, &data.HowLongToCancel, &data.Refundable, &data.RoomSize, &data.BedType, &data.MaxAdult, &data.MaxChildren,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:   "Sorry, We Cannot Found Detail Type Room Data...",
				IsSuccess: false,
				Category:  "NOT_FOUND",
			}
		} else {
			return ResponseMenuHotel{
				Message:   "There's Something Error When Getting Detail Type Room Data",
				IsSuccess: false,
				Category:  "ERROR",
			}
		}
	}

	var images []ResultTypeRoomImages

	query = `SELECT id, url FROM hotel_type_room_images WHERE id_type_room=?`

	rows, err := db.Query(query, type_room_id)

	if err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:   "Cannot Found Detail Type Room Images",
				IsSuccess: true,
				Category:  "NOT_FOUND",
				Data:      data,
			}
		} else {
			return ResponseMenuHotel{
				Message:   "There's Something Error When Getting Detail Type Room Images Data",
				IsSuccess: false,
				Category:  "ERROR",
			}
		}
	}

	defer rows.Close()

	for rows.Next() {
		var image ResultTypeRoomImages

		if err = rows.Scan(&image.ID, &image.URL); err != nil {
			return ResponseMenuHotel{
				Message:   "There's Something Error When Scanning Type Room Images",
				IsSuccess: true,
				Category:  "NOT_FOUND",
				Data:      data,
			}
		}

		images = append(images, image)
	}

	data.Images = images

	return ResponseMenuHotel{
		Message:   "Succesffully Getting Detail Type Room!",
		IsSuccess: true,
		Category:  "SUCCESS",
		Data:      data,
	}

}

// need search_engine ig
func facilities() {}

// need search_engine ig
func location() {}

// need search_engine ig
func feedback() {}

func statistic() {}
