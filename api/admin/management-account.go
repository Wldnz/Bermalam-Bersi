package admin

import (
	"fmt"
	"net/http"

	"bersi.bermalam.id/config"
	"github.com/gin-gonic/gin"
)

type ResultUserAccount struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	Email     string `json:"email"`
	CreatedAt int64  `json:"created_at"`
	Role      string `json:"role"`
	Status    string `json:"status"`
}

func GetAccounts(c *gin.Context) {

	db, err := config.ConnectToDatabase()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer db.Close()

	// currentRole := c.Query("role")
	// currentSearch := c.Query("search")

	query := "SELECT id, first_name, email, created_at, role, status FROM users"

	// if currentRole != "" && currentSearch != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE role=%s
	// 	first_name LIKE "%%s%" OR email LIKE "%%s%"
	// `, currentRole, currentSearch, currentSearch)
	// } else if currentRole != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE role=%s
	// `, currentRole)
	// } else if currentSearch != "" {
	// 	query = fmt.Sprintf(`SELECT id, first_name, email, created_at, role, status FROM users WHERE
	// 	first_name LIKE "%%s%" OR email LIKE "%%s%"
	// `, currentSearch, currentSearch)
	// }

	var resultData []ResultUserAccount

	rows, err := db.Query(query)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	defer rows.Close()

	for rows.Next() {
		var data ResultUserAccount
		if err := rows.Scan(&data.ID, &data.FirstName, &data.Email, &data.CreatedAt, &data.Role, &data.Status); err != nil {
			fmt.Print("There's something error when bind result data!")
			continue
		}
		resultData = append(resultData, data)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully Fetch Accounts Data",
		"data":    resultData,
	})

}

func GetDetailAccount(c *gin.Context) {}

func CreateAccount(c *gin.Context) {}

func DeleteAccount(c *gin.Context) {}

func UpdateAccount(c *gin.Context) {}
