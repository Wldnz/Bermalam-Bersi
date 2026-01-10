package lib

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

func CreateDokuSignature(
	client_id string,
	request_id string,
	timestamp string,
	payload string,
	targetPath string,
	secret_key string,
) string {

	h := sha256.New()
	h.Write([]byte(payload))
	bodyHash := base64.StdEncoding.EncodeToString(h.Sum(nil))

	// ini penting btw
	stringToSign := fmt.Sprintf("Client-Id:%s\n"+
		"Request-Id:%s\n"+
		"Request-Timestamp:%s\n"+
		"Request-Target:%s\n"+
		"Digest:%s",
		client_id, request_id, timestamp, targetPath, bodyHash,
	)

	key := []byte(secret_key)
	sig := hmac.New(sha256.New, key)
	sig.Write([]byte(stringToSign))

	// encode ke base64
	return base64.StdEncoding.EncodeToString(sig.Sum(nil))
}

func CreateDokuSignatureMethodGET(
	client_id string,
	request_id string,
	timestamp string,
	targetPath string,
	secret_key string,
) string {

	// ini penting btw
	stringToSign := fmt.Sprintf("Client-Id:%s\nRequest-Id:%s\nRequest-Timestamp:%s\nRequest-Target:%s",
		client_id, request_id, timestamp, targetPath,
	)

	key := []byte(secret_key)
	sig := hmac.New(sha256.New, key)
	sig.Write([]byte(stringToSign))

	// encode ke base64
	return base64.StdEncoding.EncodeToString(sig.Sum(nil))
}
