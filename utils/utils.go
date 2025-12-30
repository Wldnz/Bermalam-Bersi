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

func GenerateOTPCode() (otp string, err error) {

	otp = ""

	for i := 0; i < 4; i++ {
		num, err := rand.Int(rand.Reader, big.NewInt(10))

		if err != nil {
			return "", err
		}

		otp += fmt.Sprintf("%d", num.Int64())
	}
	return otp, err
}
