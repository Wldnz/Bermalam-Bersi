package storage

import (
	"fmt"
	"io"
	"strings"

	"bersi.bermalam.id/models"
	"cloud.google.com/go/storage"
	_ "github.com/joho/godotenv/autoload"
)

func UploudProfileAvatar(file io.Reader, filename string, mime string) models.ResponseMessageStorage {
	connection := _connectIntoStorage()

	if connection.Error != nil {
		return models.ResponseMessageStorage{
			Message:      "There Something Error When Connect Into Storage",
			ErrorMessage: connection.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer connection.Client.Close()

	pathName := fmt.Sprintf("users/%s", filename)

	o := connection.Bucket.Object(pathName).NewWriter(connection.Context)
	o.ContentType = mime

	_, err := io.Copy(o, file)

	if err != nil {
		return models.ResponseMessageStorage{
			Message:      "There Something Error Uploud The File Into Storage",
			ErrorMessage: connection.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	err = o.Close()

	if err != nil {
		return models.ResponseMessageStorage{
			Message:      "There Something Error When Close Uplouded",
			ErrorMessage: connection.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	return models.ResponseMessageStorage{
		Message:   "Succesfully Uploud Avatar!",
		Category:  "SUCCESS",
		IsSuccess: true,
		URL:       fmt.Sprintf("https://storage.googleapis.com/%s/%s", connection.Bucket.BucketName(), pathName),
	}

}

func DeleteProfileAvatar(pathName string) models.ResponseMessageStorage {

	connection := _connectIntoStorage()

	if connection.Error != nil {
		return models.ResponseMessageStorage{
			Message:      "There Something Error When Connect Into Storage",
			ErrorMessage: connection.Error.Error(),
			Category:     "ERROR",
			IsSuccess:    false,
		}
	}

	defer connection.Client.Close()

	err := connection.Bucket.Object(pathName).Delete(connection.Context)

	if err != nil {
		if strings.HasPrefix(err.Error(), storage.ErrObjectNotExist.Error()) {
			return models.ResponseMessageStorage{
				Message:      "File Doesnt Exist Or Already Deleted",
				ErrorMessage: err.Error(),
				Category:     "NOT_FOUND",
				IsSuccess:    false,
			}
		} else {
			return models.ResponseMessageStorage{
				Message:      "There Something Error When Deleting Data..",
				ErrorMessage: err.Error(),
				Category:     "ERROR",
				IsSuccess:    false,
			}
		}
	}

	return models.ResponseMessageStorage{
		Message:   "Successfully Deleting File",
		Category:  "SUCCESS",
		IsSuccess: true,
	}

}
