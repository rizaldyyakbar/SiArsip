package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/arsip-prodi/siarsip/backend/db"
	"github.com/arsip-prodi/siarsip/backend/handlers"
	"github.com/arsip-prodi/siarsip/backend/storage"
)

func main() {
	connection, err := db.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal(err)
	}
	defer connection.Close(context.Background())

	log.Println("Berhasil terhubung ke PostgreSQL")

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(writer).Encode(map[string]string{"status": "ok"})
	})

	documentHandler := handlers.NewDocumentHandler(connection, storage.NewLocal("uploads"))
	documentHandler.RegisterRoutes(mux)

	log.Println("SiArsip API berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
