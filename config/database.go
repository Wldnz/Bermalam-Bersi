package config

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"os"

	_ "github.com/go-sql-driver/mysql"

	_ "github.com/joho/godotenv/autoload"
)

func ConnectToDatabase() (db *sql.DB, err error) {

	username := os.Getenv("DATABASE_USERNAME")
	password := os.Getenv("DATABASE_PASSWORD")
	host := os.Getenv("DATABASE_HOST")
	port := os.Getenv("DATABASE_PORT")
	name := os.Getenv("DATABASE_NAME")

	credentialsData := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", username, password, host, port, name)

	db, err = sql.Open("mysql", credentialsData)

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	if err != nil {
		log.Fatal(err)
		return db, err
	}

	// ini untuk apa ya? ketika program berhenti di jalankan atau end bakal di close
	// defer db.Close()

	return db, nil

}
