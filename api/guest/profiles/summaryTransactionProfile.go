package guest_profile

import (
	"database/sql"
	"net/http"

	"bersi.bermalam.id/config"
	"bersi.bermalam.id/controller"
	"github.com/gin-gonic/gin"
)

type LevelTransaction struct {
	TotalTransactions int    `json:"total_transactions"`
	Level             string `json:"level"`
}

type ResultSummaryTransaction struct {
	TotalTransactions int `json:"total_transaction"`
	TotalSuccess      int `json:"total_success"`
	TotalOnGoing      int `json:"total_on_goings"`
	TotalCancelled    int `json:"total_cancelled"`
	TotalFails        int `json:"total_faisl"`

	LevelTransactions []LevelTransaction `json:"level_transactions"`
}

func SummaryTransactionProfile(c *gin.Context) {

	credential := controller.CheckCredentialsAccount(c)

	if !credential.IsAuthorized {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message":     "Sorry we cannot process",
			"status_code": http.StatusUnauthorized,
		})
		return
	}

	db, err := config.ConnectToDatabase()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message":     "There's Something Error When Connecting Into Database",
			"error":       err.Error(),
			"status_code": http.StatusInternalServerError,
		})
		return
	}

	defer db.Close()

	var data ResultSummaryTransaction

	query := `SELECT 
			(SELECT COUNT(id) FROM transactions WHERE id_user = ?) AS total_transactions,
			(SELECT COUNT(id) FROM transactions WHERE id_user = ? AND status='success') AS total_success,
			(SELECT COUNT(id) FROM transactions WHERE id_user = ? AND STATUS IN (
				"pending",
				"paid",
				"check_in",
				"check_out"
			)) AS total_onggoings,
			(SELECT COUNT(id)  FROM transactions WHERE id_user = ? AND status='cancelled') AS total_cancelled,
			(SELECT COUNT(id) FROM transactions WHERE id_user = ? AND status='faild') AS total_fails;`

	if err = db.QueryRow(query,
		credential.User.ID,
		credential.User.ID,
		credential.User.ID,
		credential.User.ID,
		credential.User.ID,
	).Scan(
		&data.TotalTransactions,
		&data.TotalSuccess,
		&data.TotalOnGoing,
		&data.TotalCancelled,
		&data.TotalFails,
	); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "Sorry we cannot found any transaction you had",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Summary Transactions",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
		}
		return
	}

	if data.TotalTransactions < 10 {
		c.JSON(http.StatusForbidden, gin.H{
			"message":     "Sorry.. Minimum Transaction You Have Is 10",
			"status_code": http.StatusForbidden,
		})
		return
	}

	query = `SELECT COUNT(id), level FROM transactions WHERE id_user = ? GROUP BY LEVEL`

	rows, err := db.Query(query, credential.User.ID)

	if err != nil {
		return
	}

	defer rows.Close()

	for rows.Next() {
		var levelTransaction LevelTransaction

		if err = rows.Scan(
			&levelTransaction.TotalTransactions, &levelTransaction.Level,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message":     "There's Something Error When Getting Summary Transactions Level",
				"error":       err.Error(),
				"status_code": http.StatusInternalServerError,
			})
			return
		}
		data.LevelTransactions = append(data.LevelTransactions, levelTransaction)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Succesfully Getting Summary Transactions",
		"data":        data,
		"status_code": http.StatusOK,
	})

}
