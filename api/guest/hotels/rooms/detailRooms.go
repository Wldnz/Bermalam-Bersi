package hotel_room

import (
	"net/http"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResponsesResultRoom struct {
	Message      string
	ErrorMessage string
	IsSuccess    bool
	Category     string
}

type ResultRoomImages struct {
	URL      string `json:"url"`
	IsPinned bool   `json:"is_pinned"`
}

type ResponseResultRoomImages struct {
	Response ResponsesResultRoom
	Data     []ResultRoomImages
}

type ResponseRoomFacilities struct {
	Response ResponsesResultRoom
	Data     []string
}

type ResultBenefitRooms struct {
	Name     string `json:"name"`
	Category string `json:"category"`
}

type ResponseBenefitRooms struct {
	Response ResponsesResultRoom
	Data     []ResultBenefitRooms
}

type ResultRoomRules struct {
	Name     string `json:"name"`
	Category string `json:"category"`
}

type ResponseRoomRules struct {
	Response ResponsesResultRoom
	Data     []ResultRoomRules
}

type ResponseDetailRoom struct {
	Images     []ResultRoomImages   `json:"images"`
	Rules      []ResultRoomRules    `json:"rules"`
	Facilities []string             `json:"facilities"`
	Benefits   []ResultBenefitRooms `json:"benefits"`
}

func GetDetailRoom(c *gin.Context) {

	id := c.Param("id")

	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Please provide the ID!",
		})
		return
	}

	images := getRoomImages(id)

	if !images.Response.IsSuccess {
		if images.Response.Category == "NOT_FOUND" {
			c.JSON(http.StatusNotFound, gin.H{
				"message":    images.Response.Message,
				"error":      images.Response.ErrorMessage,
				"satus_code": http.StatusNotFound,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":    images.Response.Message,
				"error":      images.Response.ErrorMessage,
				"satus_code": http.StatusInternalServerError,
			})
		}
		return
	}

	rules := getRoomRules(id)

	if !rules.Response.IsSuccess && rules.Response.Category == "NOT_FOUND" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":    rules.Response.Message,
			"error":      rules.Response.ErrorMessage,
			"satus_code": http.StatusInternalServerError,
		})
		return
	}

	facilities := getFacilites(id)

	if !facilities.Response.IsSuccess && facilities.Response.Category == "NOT_FOUND" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":    facilities.Response.Message,
			"error":      facilities.Response.ErrorMessage,
			"satus_code": http.StatusInternalServerError,
		})
		return
	}

	benefits := getBenefits(id)

	if !benefits.Response.IsSuccess && benefits.Response.Category == "NOT_FOUND" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":    benefits.Response.Message,
			"error":      benefits.Response.ErrorMessage,
			"satus_code": http.StatusInternalServerError,
		})
		return
	}

	data := ResponseDetailRoom{
		Images:     images.Data,
		Rules:      rules.Data,
		Facilities: facilities.Data,
		Benefits:   benefits.Data,
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Data..",
		"data":        data,
		"status_code": http.StatusOK,
	})

}

func getRoomImages(id string) ResponseResultRoomImages {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseResultRoomImages{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT url, isPinned FROM hotel_type_room_images WHERE id_type_room = ?`

	rows, err := db.Query(query, id)

	if err != nil {
		return ResponseResultRoomImages{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Getting Detail Rooms!",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Next()

	images := []ResultRoomImages{}

	for rows.Next() {
		var image ResultRoomImages
		if err = rows.Scan(&image.URL, &image.IsPinned); err != nil {
			return ResponseResultRoomImages{
				Response: ResponsesResultRoom{
					Message:      "There's Something Error When Scanning Detail Data Rooms!",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		images = append(images, image)
	}

	if len(images) == 0 {
		return ResponseResultRoomImages{
			Response: ResponsesResultRoom{
				Message:   "Sorry We Cannot Found Any Room Images!",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseResultRoomImages{
		Response: ResponsesResultRoom{
			Message:   "Succesfully Getting Room Images",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: images,
	}

}

func getRoomRules(id string) ResponseRoomRules {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseRoomRules{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT name, category FROM hotel_type_room_rules WHERE id_type_room=?`

	rows, err := db.Query(query, id)

	if err != nil {
		return ResponseRoomRules{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Getting Room Rules Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	rules := []ResultRoomRules{}

	for rows.Next() {
		var rule ResultRoomRules
		if err = rows.Scan(&rule.Name, &rule.Category); err != nil {
			return ResponseRoomRules{
				Response: ResponsesResultRoom{
					Message:      "There's Something Error When Scanning Room Rules Data",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		rules = append(rules, rule)
	}

	if len(rules) == 0 {
		return ResponseRoomRules{
			Response: ResponsesResultRoom{
				Message:   "Sorry we cannot found any room rules",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseRoomRules{
		Response: ResponsesResultRoom{
			Message:   "Succesfully Getting Room Rules",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: rules,
	}

}

func getFacilites(id string) ResponseRoomFacilities {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseRoomFacilities{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT f.name FROM hotel_facilities hf INNER JOIN facilities f ON f.id = hf.id_facilities
			WHERE hf.category = 'room' AND hf.id_type_room = ?;
		`

	rows, err := db.Query(query, id)

	if err != nil {
		return ResponseRoomFacilities{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Getting Room Facilites Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	facilities := []string{}

	for rows.Next() {
		var facility string
		if err = rows.Scan(&facility); err != nil {
			return ResponseRoomFacilities{
				Response: ResponsesResultRoom{
					Message:      "There's Something Error When Scaning Room Facilites Data",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		facilities = append(facilities, facility)
	}

	if len(facilities) == 0 {
		return ResponseRoomFacilities{
			Response: ResponsesResultRoom{
				Message:   "Sorry We Cannot Find Any Room Facilities",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseRoomFacilities{
		Response: ResponsesResultRoom{
			Message:   "Succesfully Getting Room Facilities Data!",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: facilities,
	}

}

func getBenefits(id string) ResponseBenefitRooms {
	db, err := config.ConnectToDatabase()

	if err != nil {
		return ResponseBenefitRooms{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Connecting Into Database",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer db.Close()

	query := `SELECT name, category FROM hotel_type_room_benefit WHERE id_type_room = ?;`

	rows, err := db.Query(query, id)

	if err != nil {
		return ResponseBenefitRooms{
			Response: ResponsesResultRoom{
				Message:      "There's Something Error When Getting Benefits Room Data",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			},
		}
	}

	defer rows.Close()

	benefits := []ResultBenefitRooms{}

	for rows.Next() {
		var benefit ResultBenefitRooms

		if err = rows.Scan(&benefit.Name, &benefit.Category); err != nil {
			return ResponseBenefitRooms{
				Response: ResponsesResultRoom{
					Message:      "There's Something Error When Scanning Benefits Room Data",
					ErrorMessage: err.Error(),
					Category:     "ERROR",
					IsSuccess:    false,
				},
			}
		}
		benefits = append(benefits, benefit)
	}

	if len(benefits) == 0 {
		return ResponseBenefitRooms{
			Response: ResponsesResultRoom{
				Message:   "Sorry We Cannot Found Any Benefits",
				Category:  "NOT_FOUND",
				IsSuccess: false,
			},
		}
	}

	return ResponseBenefitRooms{
		Response: ResponsesResultRoom{
			Message:   "Succesfully Getting Benefit Rooms",
			Category:  "SUCCESS",
			IsSuccess: true,
		},
		Data: benefits,
	}

}
