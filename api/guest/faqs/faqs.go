package guest_faqs

import (
	"net/http"
	"strings"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultFAQS struct {
	Question string `json:"question"`
	Answer   string `json:"answer"`
}

func GetFAQS(c *gin.Context) {

	category := c.DefaultQuery("category", "guest")

	if strings.ToLower(category) == "hotel" {
		category = "hotel_owner"
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Erorr When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	query := "SELECT question, answer FROM faqs WHERE category=? LIMIT 5"

	rows, err := db.Query(query, category)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Erorr When Getting FAQS",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	faqs := []ResultFAQS{}

	defer rows.Close()

	for rows.Next() {
		var faq ResultFAQS

		if err = rows.Scan(&faq.Question, &faq.Answer); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Erorr When Scanning Faqs Data",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		faqs = append(faqs, faq)
	}

	if len(faqs) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message":     "Sorry.. We Cannot Found Any FAQS",
			"status_code": http.StatusNotFound,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting FAQS Data",
		"data":        faqs,
		"status_code": http.StatusOK,
	})

}
