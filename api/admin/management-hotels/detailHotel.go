package admin_management_hotel

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/models"
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

type ResultHotelFacility struct {
	ID           int    `json:"id"`
	FacilityName string `json:"facility_name"`
	CategoryName string `json:"category_name"`
	CreatedAt    string `json:"created_at"`
}

type ResultDetailFacility struct {
	ResultHotelFacility
	UpdatedAt string `json:"updated_at"`
	// CreatedBy string `json:"created_by"`
	// UpdatedBy string `json:"updated_by"`
	// CategoryFacilities []ResultCategoryFacility `json:"category_facilities"`
	// Facilities         []ResultFacility `json:"facilities"`
}

type ResultHotelLocation struct {
	ID        int    `json:"id"`
	Address_1 string `json:"address_2"`
	Address_2 string `json:"address_1"`
	ZipCode   string `json:"zip_code"`
	Country   string `json:"country"`
	City      string `json:"city"`
	Longitude string `json:"longitude"`
	Latitude  string `json:"latitude"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type ResultFAQHotel struct {
	ID        int    `json:"id"`
	Question  string `json:"question"`
	Answer    string `json:"answer"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type ResultFeedback struct {
	ID        int    `json:"id"`
	GuestName string `json:"guest_name"`
	Value     string `json:"value"`
	Category  string `json:"category"`
	Stars     string `json:"stars"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	RoomNames string `json:"room_names"`
}

type ResultStatisticDataRaw struct {
	TotalVisits     sql.NullInt32 `json:"total_visits"`
	TotalOrders     sql.NullInt32 `json:"total_orders"`
	CancelledOrders sql.NullInt32 `json:"cancelled_orders"`
	// TotalRequestRefund sql.NullInt32 `json:"total_request_refund"`
	TotalRefund       sql.NullInt32  `json:"total_refund"`
	TotalReceptionist sql.NullInt32  `json:"total_receptionist"`
	TotalRevenue      sql.NullString `json:"total_revenue"`
	// tambahakan data / query untuk melihat dari mana aja pengunjung

}
type ResultStatisticData struct {
	TotalVisits     int `json:"total_visits"`
	TotalOrders     int `json:"total_orders"`
	CancelledOrders int `json:"cancelled_orders"`
	// TotalRequestRefund int `json:"total_request_refund"`
	TotalRefund       int    `json:"total_refund"`
	TotalReceptionist int    `json:"total_receptionist"`
	TotalRevenue      string `json:"total_revenue"`
	// tambahakan data / query untuk melihat dari mana aja pengunjung

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
	search := c.Query("search")
	id := c.Query("id")
	timeSelected := c.Query("timeSelected")
	category := c.DefaultQuery("category", "erning")

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
		data := typeRooms(hotel_id, search)
		response = data
	case "detail-room":
		data := detailTypeRoom(id)
		response = data
	case "facilities":
		data := facilities(hotel_id, search)
		response = data
	case "detail-facility":
		data := detailFacility(id)
		response = data
	case "location":
		data := location(hotel_id)
		response = data
	case "faqs":
		data := faq(hotel_id, search)
		response = data
	case "detail-faqs":
		data := detailFaq(id)
		response = data
	case "feedbacks":
		data := feedback(hotel_id)
		response = data
	case "statistic":
		data := statistic(hotel_id, timeSelected, category)
		response = data
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

func typeRooms(hotel_id string, search string) ResponseMenuHotel {

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

	var initQuery models.IntiliazeQueryRows

	typeRooms := []ResultTypeRoomHotel{}

	query := `SELECT  htr.id, htr.name, htr.room_size, htr.bed_type, COUNT(DISTINCT hr.id) AS total_rooms
						FROM hotels h
							INNER JOIN hotel_type_rooms htr ON htr.id_hotel = h.id
								INNER JOIN hotel_rooms hr ON hr.id_type_room = htr.id
								WHERE h.id =?`

	searchParam := "%" + search + "%"

	if search != "" {
		query += ` AND htr.name LIKE ? GROUP BY h.id, htr.id`
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id, searchParam)
	} else {
		query += ` GROUP BY h.id, htr.id`
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Getting Type Rooms",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	for initQuery.Rows.Next() {
		var typeRoom ResultTypeRoomHotel
		if err = initQuery.Rows.Scan(&typeRoom.ID, &typeRoom.Name, &typeRoom.RoomSize, &typeRoom.BedType, &typeRoom.TotalRooms); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Type Rooms",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		typeRooms = append(typeRooms, typeRoom)
	}

	if len(typeRooms) == 0 {
		return ResponseMenuHotel{
			Message:   "Hotel Doesn't Have Any Rooms!",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
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

	images := []ResultTypeRoomImages{}

	query = `SELECT id, url FROM hotel_type_room_images WHERE id_type_room=?`

	rows, err := db.Query(query, type_room_id)

	if err != nil {
		return ResponseMenuHotel{
			Message:   "There's Something Error When Getting Detail Type Room Images Data",
			IsSuccess: false,
			Category:  "ERROR",
		}
	}

	defer rows.Close()

	for rows.Next() {
		var image ResultTypeRoomImages

		if err = rows.Scan(&image.ID, &image.URL); err != nil {
			return ResponseMenuHotel{
				Message:   "There's Something Error When Scanning Type Room Images",
				IsSuccess: false,
				Category:  "ERROR",
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
func facilities(hotel_id string, search string) ResponseMenuHotel {
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

	var initQuery models.IntiliazeQueryRows

	searchParam := "%" + search + "%"

	query := `SELECT hf.id, f.name AS facility_name, cf.name AS category_name, hf.created_at FROM category_facilities cf
	INNER JOIN facilities f ON f.id_category_facility = cf.id 
		INNER JOIN hotel_facilities hf ON hf.id_facilities = f.id
			WHERE hf.id_hotel=? AND category='hotel'`

	if search != "" {
		query += ` AND f.name LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Getting Hotel Facilities",
			ErrorMessage: initQuery.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	facilities := []ResultHotelFacility{}

	for initQuery.Rows.Next() {
		var facility ResultHotelFacility

		if err = initQuery.Rows.Scan(&facility.ID, &facility.FacilityName, &facility.CategoryName, &facility.CreatedAt); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Scanning Hotel Facilities",
				ErrorMessage: initQuery.Error.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
		facilities = append(facilities, facility)
	}

	if len(facilities) == 0 {
		return ResponseMenuHotel{
			Message:   "Sorry We Cannot Found Facility...",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Hotel Facilities",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      facilities,
	}

}

func detailFacility(facility_id string) ResponseMenuHotel {
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

	var data ResultDetailFacility

	query := `SELECT hf.id, f.name AS facility_name, cf.name AS category_name, hf.created_at, hf.updated_at FROM category_facilities cf
	INNER JOIN facilities f ON f.id_category_facility = cf.id 
		INNER JOIN hotel_facilities hf ON hf.id_facilities = f.id
			WHERE hf.id=? AND category='hotel'`

	if err = db.QueryRow(query, facility_id).Scan(&data.ID, &data.FacilityName, &data.CategoryName, &data.CreatedAt, &data.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Cannot Found Detail Hotel Facility",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Detail Hotel Facility",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfuly Getting Detail Hotel Facility",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

func location(hotel_id string) ResponseMenuHotel {

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

	query := `SELECT id, address_1, address_2, zip_code, country, city, longitude, latitude, created_at, updated_at FROM hotel_location WHERE id_hotel=?`

	var data ResultHotelLocation

	if err = db.QueryRow(query, hotel_id).Scan(
		&data.ID, &data.Address_1, &data.Address_2, &data.ZipCode, &data.Country, &data.City, &data.Longitude, &data.Latitude, &data.CreatedAt, &data.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Sorry We Cannot Found Location..",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Data Hotel Location",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Location Hotel!",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

// tambahkan hotel_near_location? karena ada jaraknya

// need search_engine ig
func faq(
	hotel_id string,
	search string,
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

	var initQuery models.IntiliazeQueryRows

	// tambahkan berapa banyak orang terbantu.... (optional ya wkwkwk)

	query := `SELECT id, question, answer, created_at, updated_at FROM faqs WHERE id_hotel IS NOT NULL AND id_hotel=?`

	searchParam := "%" + search + "%"

	if search != "" {
		query += ` AND question LIKE ?`
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id, searchParam)
	} else {
		initQuery.Rows, initQuery.Error = db.Query(query, hotel_id)
	}

	if initQuery.Error != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Getting FAQS HOTEL",
			Category:     "ERROR",
			ErrorMessage: initQuery.Error.Error(),
			IsSuccess:    false,
		}
	}

	defer initQuery.Rows.Close()

	data := []ResultFAQHotel{}

	for initQuery.Rows.Next() {
		var faq ResultFAQHotel

		if err = initQuery.Rows.Scan(&faq.ID, &faq.Question, &faq.Answer, &faq.CreatedAt, &faq.UpdatedAt); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Scanning Data FAQS HOTEL",
				Category:     "ERROR",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}
		data = append(data, faq)
	}

	if len(data) == 0 {
		return ResponseMenuHotel{
			Message:   "Cannot Find FAQ...",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Data FAQS HOTEL",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}

}

func detailFaq(
	faq_id string,
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

	// tambahkan berapa banyak orang terbantu.... (optional ya wkwkwk)

	query := `SELECT id, question, answer, created_at, updated_at FROM faqs WHERE id_hotel IS NOT NULL AND id_hotel=?`

	var faq ResultFAQHotel

	if err = db.QueryRow(query, faq_id).Scan(&faq.ID, &faq.Question, &faq.Answer, &faq.CreatedAt, &faq.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Cannot Find FAQ...",
				Category:     "NOT_FOUND",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Data FAQS HOTEL",
				Category:     "ERROR",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Data FAQS HOTEL",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      faq,
	}

}

func feedback(
	hotel_id string,
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

	query := `SELECT 
			hf.id, hf.guest_name, hf.value, hf.category, hf.stars, hf.created_at, hf.updated_at,
			GROUP_CONCAT(DISTINCT SUBSTRING_INDEX(htr.name, ',', 1) SEPARATOR ', ') AS room_names
		FROM hotel_feedback hf
			INNER JOIN transactions t ON t.id = hf.id_transaction
			INNER JOIN booking b ON b.id_transaction = t.id 
			INNER JOIN hotel_type_rooms htr ON htr.id = b.id_type_room
			INNER JOIN hotels h ON h.id = htr.id_hotel
				WHERE h.id = ?
				GROUP BY hf.id`

	rows, err := db.Query(query, hotel_id)

	if err != nil {
		return ResponseMenuHotel{
			Message:      "There's Something Error When Getting Feedback Hotel",
			Category:     "error",
			ErrorMessage: err.Error(),
			IsSuccess:    false,
		}
	}

	defer rows.Close()

	data := []ResultFeedback{}

	for rows.Next() {
		var feedback ResultFeedback

		if err = rows.Scan(&feedback.ID, &feedback.GuestName, &feedback.Value, &feedback.Category, &feedback.Stars, &feedback.CreatedAt, &feedback.UpdatedAt, &feedback.RoomNames); err != nil {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Scanning Data Feedback Hotel",
				Category:     "error",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}

		data = append(data, feedback)
	}

	if len(data) == 0 {
		return ResponseMenuHotel{
			Message:   "Sorry We Cannot Found Feedback",
			Category:  "NOT_FOUND",
			IsSuccess: false,
		}
	}

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Feedbacks Hotel Data",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}
}

func statistic(
	hotel_id string,
	timeSelected string,
	category string,
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

	currentTimeSelected := handleSelectedTime(timeSelected)

	switch category {
	case "earning":
		category = "success"
	case "pending":
		category = "paid"
	}

	query := `SELECT 
	(SELECT COUNT(b.id) FROM transactions t
	INNER JOIN booking b ON b.id_transaction = t.id
		INNER JOIN hotel_type_rooms htr ON b.id_type_room = htr.id
			 WHERE htr.id_hotel = ? AND t.created_at >=?) AS total_orders,
	(SELECT COUNT(b.id) FROM transactions t
	INNER JOIN booking b ON b.id_transaction = t.id
		INNER JOIN hotel_type_rooms htr ON b.id_type_room = htr.id
			 WHERE htr.id_hotel = ? AND t.created_at >=? AND t.status='cancelled') AS total_cancelled,
	(SELECT COUNT(b.id) FROM transactions t
	INNER JOIN booking b ON b.id_transaction = t.id
		INNER JOIN hotel_type_rooms htr ON b.id_type_room = htr.id
			INNER JOIN request_refund_transaction rrt ON rrt.id_transaction = t.id
			 WHERE htr.id_hotel = ? AND t.created_at >=? AND rrt.status='request_refund') AS total_refund,
	(SELECT COUNT(u.id) AS total_receptionist FROM users u
	INNER JOIN hotel_receptionists hr ON hr.id_user = u.id
		WHERE hr.id_hotel=? AND u.created_at >= ?
		GROUP BY hr.id_hotel) AS total_receptionist,
	(SELECT SUM(t.total_price) AS total_price FROM transactions t
	INNER JOIN booking b ON b.id_transaction = t.id
		INNER JOIN hotel_type_rooms htr ON b.id_type_room = htr.id
			 WHERE htr.id_hotel = ? AND t.created_at >= ? AND t.status = ? 
			 GROUP BY htr.id_hotel) AS total_revenue`

	var dataRaw ResultStatisticDataRaw
	var data ResultStatisticData

	// Gunakan QueryRow karena kita hanya mengharapkan satu baris hasil
	err = db.QueryRow(query,
		hotel_id, currentTimeSelected,
		hotel_id, currentTimeSelected,
		hotel_id, currentTimeSelected,
		hotel_id, currentTimeSelected,
		hotel_id, currentTimeSelected, category,
	).Scan(
		&dataRaw.TotalOrders, &dataRaw.CancelledOrders, &dataRaw.TotalRefund, &dataRaw.TotalReceptionist, &dataRaw.TotalRevenue,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return ResponseMenuHotel{
				Message:      "Sorry We Cannot Found Statistic Data...",
				Category:     "NOT_FOUND",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		} else {
			return ResponseMenuHotel{
				Message:      "There's Something Error When Getting Statistic Data...",
				Category:     "ERROR",
				ErrorMessage: err.Error(),
				IsSuccess:    false,
			}
		}
	}

	data.TotalVisits = int(dataRaw.TotalVisits.Int32)
	data.TotalOrders = int(dataRaw.TotalOrders.Int32)
	data.TotalReceptionist = int(dataRaw.TotalReceptionist.Int32)
	data.TotalRefund = int(dataRaw.TotalRefund.Int32)
	data.CancelledOrders = int(dataRaw.CancelledOrders.Int32)
	data.TotalRevenue = dataRaw.TotalRevenue.String

	return ResponseMenuHotel{
		Message:   "Succesfully Getting Statistic Data",
		Category:  "SUCCESS",
		IsSuccess: true,
		Data:      data,
	}
}

func handleSelectedTime(selectedTime string) int64 {
	currentTime := time.Now()
	currentTimeMili := currentTime.UnixMilli()

	defaultTime := int64(60 * 60 * 24 * 30 * 10000)

	switch selectedTime {
	case "all_time":
		return 0
	case "month":
		return currentTimeMili - (defaultTime)
	case "six_month":
		return currentTimeMili - (defaultTime * 6)
	case "year":
		return currentTimeMili - (defaultTime * 12)
	case "two_years":
		return currentTimeMili - (defaultTime * 24)
	default:
		// default adalah sebulan
		return currentTimeMili - (defaultTime)
	}
}
