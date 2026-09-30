package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")

	connection, err := pgx.Connect(context.Background(), databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer connection.Close(context.Background())

	if err := connection.Ping(context.Background()); err != nil {
		log.Fatal(err)
	}

	log.Println("Berhasil terhubung ke PostgreSQL")

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(writer).Encode(map[string]string{"status": "ok"})
	})

	mux.HandleFunc("GET /documents", func(writer http.ResponseWriter, request *http.Request) {
		rows, err := connection.Query(request.Context(), `
			SELECT id, title, category, year, file_path, created_at
			FROM documents
			ORDER BY created_at DESC
		`)
		if err != nil {
			http.Error(writer, "Gagal mengambil dokumen", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		documents := make([]map[string]any, 0)
		for rows.Next() {
			var id int64
			var title, category, filePath string
			var year int
			var createdAt any

			if err := rows.Scan(&id, &title, &category, &year, &filePath, &createdAt); err != nil {
				http.Error(writer, "Gagal membaca dokumen", http.StatusInternalServerError)
				return
			}

			documents = append(documents, map[string]any{
				"id":         id,
				"title":      title,
				"category":   category,
				"year":       year,
				"file_path":  filePath,
				"created_at": createdAt,
			})
		}

		if err := rows.Err(); err != nil {
			http.Error(writer, "Gagal membaca dokumen", http.StatusInternalServerError)
			return
		}

		writer.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(writer).Encode(documents)
	})

	log.Println("SiArsip API berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
