package main

import (
	"context"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

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

	mux.HandleFunc("POST /documents/upload", func(writer http.ResponseWriter, request *http.Request) {
		request.Body = http.MaxBytesReader(writer, request.Body, 25*1024*1024)

		if err := request.ParseMultipartForm(25 * 1024 * 1024); err != nil {
			http.Error(writer, "Ukuran upload maksimal 25 MB", http.StatusRequestEntityTooLarge)
			return
		}

		title := strings.TrimSpace(request.FormValue("title"))
		category := strings.TrimSpace(request.FormValue("category"))
		year, err := strconv.Atoi(request.FormValue("year"))
		if title == "" || category == "" || err != nil {
			http.Error(writer, "title, category, dan year wajib diisi", http.StatusBadRequest)
			return
		}

		file, header, err := request.FormFile("file")
		if err != nil {
			http.Error(writer, "File wajib diunggah dengan field 'file'", http.StatusBadRequest)
			return
		}
		defer file.Close()

		extension := strings.ToLower(filepath.Ext(header.Filename))
		allowedExtensions := map[string]bool{".pdf": true, ".csv": true, ".xlsx": true}
		if !allowedExtensions[extension] {
			http.Error(writer, "Format file harus PDF, CSV, atau XLSX", http.StatusBadRequest)
			return
		}

		if err := os.MkdirAll("uploads", 0755); err != nil {
			http.Error(writer, "Gagal menyiapkan penyimpanan file", http.StatusInternalServerError)
			return
		}

		var randomNameBytes [16]byte
		if _, err := rand.Read(randomNameBytes[:]); err != nil {
			http.Error(writer, "Gagal membuat nama file", http.StatusInternalServerError)
			return
		}
		storedName := fmt.Sprintf("%x%s", randomNameBytes, extension)
		storedPath := filepath.Join("uploads", storedName)

		storedFile, err := os.Create(storedPath)
		if err != nil {
			http.Error(writer, "Gagal menyimpan file", http.StatusInternalServerError)
			return
		}

		if _, err := io.Copy(storedFile, file); err != nil {
			storedFile.Close()
			_ = os.Remove(storedPath)
			http.Error(writer, "Gagal menulis file", http.StatusInternalServerError)
			return
		}
		if err := storedFile.Close(); err != nil {
			_ = os.Remove(storedPath)
			http.Error(writer, "Gagal menutup file", http.StatusInternalServerError)
			return
		}

		var documentID int64
		err = connection.QueryRow(request.Context(), `
			INSERT INTO documents (title, category, year, file_path)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`, title, category, year, storedPath).Scan(&documentID)
		if err != nil {
			_ = os.Remove(storedPath)
			http.Error(writer, "Gagal menyimpan metadata dokumen", http.StatusInternalServerError)
			return
		}

		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(writer).Encode(map[string]any{
			"id":        documentID,
			"title":     title,
			"category":  category,
			"year":      year,
			"file_name": header.Filename,
			"file_path": storedPath,
		})
	})

	log.Println("SiArsip API berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
