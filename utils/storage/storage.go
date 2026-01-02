package storage

import (
	"context"
	"fmt"
	"log"
	"os"

	"cloud.google.com/go/storage"
	_ "github.com/joho/godotenv/autoload"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

func GetObjects() {

	credentialsPath := os.Getenv("GOOGLE_STORAGE_CREDENTIAL_PATH")
	bucketName := os.Getenv("GOOLE_BUCKET_NAME")

	ctx := context.Background()

	c, err := storage.NewClient(ctx, option.WithCredentialsFile(credentialsPath))

	if err != nil {
		fmt.Printf("Cannot Connect Into Storage, %s ", err.Error())
		return
	}

	defer c.Close()

	fmt.Print("Berhasil Konek Ke Google Cloud Storage!")

	bkt := c.Bucket(bucketName)
	// bkt.Objects()
	// obj := bkt.Object("bermalam_bersi/login_mitra_otp_success.png")

	// attrs, err := obj.Attrs(ctx)

	// if err != nil {
	// 	fmt.Println("")
	// 	fmt.Printf("There Seomthing Error, %s", err.Error())
	// 	return
	// }

	bkt.Attrs(ctx)

	query := &storage.Query{Prefix: ""}

	type ResponseWantInterface struct {
		Name string
		URL  string
	}

	// var names []interface{}

	it := bkt.Objects(ctx, query)
	for {
		attrs, err := it.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatal(err)
		}
		data := &ResponseWantInterface{
			Name: attrs.Name,
			URL:  attrs.MediaLink,
		}
		fmt.Println(data)
	}
	// fmt.Println("mengambil data object dengan nama : " + attrs.Name + " dan linknya: " + attrs.MediaLink)

}

type ConnectionStorage struct {
	Context context.Context
	Client  *storage.Client
	Bucket  *storage.BucketHandle
	Error   error
}

func _connectIntoStorage() ConnectionStorage {
	credentialsPath := os.Getenv("GOOGLE_STORAGE_CREDENTIAL_PATH")
	bucketName := os.Getenv("GOOGLE_BUCKET_NAME")

	ctx := context.Background()

	c, err := storage.NewClient(ctx, option.WithCredentialsFile(credentialsPath))

	if err != nil {
		// fmt.Printf("Cannot Connect Into Storage, %s ", err.Error())
		return ConnectionStorage{
			Context: ctx,
			Client:  nil,
			Error:   err,
		}
	}

	bucket := c.Bucket(bucketName)

	return ConnectionStorage{
		Context: ctx,
		Client:  c,
		Bucket:  bucket,
		Error:   nil,
	}
}
