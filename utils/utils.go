package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math/big"

	"golang.org/x/crypto/bcrypt"
)

func CreateHashPassword(password string) (hashedPassword []byte, err error) {
	hashedPassword, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err != nil {
		return nil, err
	}

	return hashedPassword, nil
}

func CreateRandomToken() (token string, err error) {
	_32bit := make([]byte, 32)
	_, err = rand.Read(_32bit)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(_32bit), nil
}

func CompareHashPassword(hashedPassword string, password string) bool {

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)); err != nil {
		return false
	}
	return true
}

func GenerateOTPCode() (string, error) {

	max := big.NewInt(9000)

	num, err := rand.Int(rand.Reader, max)

	if err != nil {
		return "", err
	}

	// Tambahkan 1000 agar rentangnya menjadi 1000 sampai 9999
	otp := num.Int64() + 1000

	return fmt.Sprintf("%d", otp), nil
}

func IsStringEmpty(message string) bool {
	return message == ""
}

func IsMultipleStringEmpty(messages []string) bool {
	for _, message := range messages {
		if !IsStringEmpty(message) {
			return false
		}
	}
	return true
}
