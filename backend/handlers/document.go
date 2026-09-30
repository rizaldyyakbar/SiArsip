package handlers

import (
	"encoding/json"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/arsip-prodi/siarsip/backend/storage"
	"github.com/jackc/pgx/v5"
)

type DocumentHandler struct {
	connection *pgx.Conn
	storage    storage.Local
}

func NewDocumentHandler(connection *pgx.Conn, fileStorage storage.Local) *DocumentHandler {
	return &DocumentHandler{connection: connection, storage: fileStorage}
}

func (handler *DocumentHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /documents", handler.list)
	mux.HandleFunc("POST /documents/upload", handler.upload)
}

func (handler *DocumentHandler) list(writer http.ResponseWriter, request *http.Request) {
	rows, err := handler.connection.Query(request.Context(), `
		SELECT id, title, category, year, file_path, created_at
		FROM documents
		ORDER BY created_at DESC
	`)
	if err != nil {
		http.Error(writer, "Gagal mengambil dokumen", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	documents := make([]models.Document, 0)
	for rows.Next() {
		var document models.Document
		if err := rows.Scan(
			&document.ID,
			&document.Title,
			&document.Category,
			&document.Year,
			&document.FilePath,
			&document.CreatedAt,
		); err != nil {
			http.Error(writer, "Gagal membaca dokumen", http.StatusInternalServerError)
			return
		}
		documents = append(documents, document)
	}

	if err := rows.Err(); err != nil {
		http.Error(writer, "Gagal membaca dokumen", http.StatusInternalServerError)
		return
	}

	writeJSON(writer, http.StatusOK, documents)
}

func (handler *DocumentHandler) upload(writer http.ResponseWriter, request *http.Request) {
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

	storedPath, err := handler.storage.Save(file, extension)
	if err != nil {
		http.Error(writer, "Gagal menyimpan file", http.StatusInternalServerError)
		return
	}

	var documentID int64
	err = handler.connection.QueryRow(request.Context(), `
		INSERT INTO documents (title, category, year, file_path)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`, title, category, year, storedPath).Scan(&documentID)
	if err != nil {
		_ = handler.storage.Remove(storedPath)
		http.Error(writer, "Gagal menyimpan metadata dokumen", http.StatusInternalServerError)
		return
	}

	writeJSON(writer, http.StatusCreated, map[string]any{
		"id":        documentID,
		"title":     title,
		"category":  category,
		"year":      year,
		"file_name": header.Filename,
		"file_path": storedPath,
	})
}

func writeJSON(writer http.ResponseWriter, status int, value any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(value)
}
