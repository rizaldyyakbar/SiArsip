package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CategoryHandler struct {
	connection *pgxpool.Pool
}

func NewCategoryHandler(conn *pgxpool.Pool) *CategoryHandler {
	return &CategoryHandler{connection: conn}
}

func (h *CategoryHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /categories", h.list)
	mux.HandleFunc("POST /categories", h.create)
	mux.HandleFunc("PUT /categories/{id}", h.update)
	mux.HandleFunc("DELETE /categories/{id}", h.delete)
}

func (h *CategoryHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(), `
		SELECT c.id, c.name, c.code, COALESCE(c.description, ''),
		       c.color_bg, c.color_text, c.created_at, c.updated_at,
		       COUNT(d.id) AS document_count
		FROM categories c
		LEFT JOIN documents d ON d.category = c.name AND d.deleted_at IS NULL
		GROUP BY c.id, c.name, c.code, c.description, c.color_bg, c.color_text, c.created_at, c.updated_at
		ORDER BY c.id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data kategori: "+err.Error())
		return
	}
	defer rows.Close()

	categories := []models.Category{}
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(
			&c.ID, &c.Name, &c.Code, &c.Description,
			&c.ColorBg, &c.ColorText, &c.CreatedAt, &c.UpdatedAt,
			&c.DocumentCount,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca data kategori: "+err.Error())
			return
		}
		categories = append(categories, c)
	}

	writeJSON(w, http.StatusOK, categories)
}

func (h *CategoryHandler) create(w http.ResponseWriter, r *http.Request) {
	var body models.CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	body.Name = strings.TrimSpace(body.Name)
	body.Code = strings.ToUpper(strings.TrimSpace(body.Code))
	body.Description = strings.TrimSpace(body.Description)
	body.ColorBg = strings.TrimSpace(body.ColorBg)
	body.ColorText = strings.TrimSpace(body.ColorText)

	if body.Name == "" || body.Code == "" {
		writeError(w, http.StatusBadRequest, "Nama dan Kode Kategori wajib diisi")
		return
	}
	if body.ColorBg == "" {
		body.ColorBg = "#fff0f2"
	}
	if body.ColorText == "" {
		body.ColorText = "#ba1a1a"
	}

	var id int
	err := h.connection.QueryRow(r.Context(), `
		INSERT INTO categories (name, code, description, color_bg, color_text)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`,
		body.Name, body.Code, body.Description, body.ColorBg, body.ColorText,
	).Scan(&id)

	if err != nil {
		if strings.Contains(err.Error(), "categories_name_key") {
			writeError(w, http.StatusConflict, "Kategori dengan nama '"+body.Name+"' sudah ada")
			return
		}
		if strings.Contains(err.Error(), "categories_code_key") {
			writeError(w, http.StatusConflict, "Kode kategori '"+body.Code+"' sudah digunakan")
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal menambah kategori: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Kategori berhasil ditambahkan",
	})
}

func (h *CategoryHandler) update(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var body models.UpdateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	body.Name = strings.TrimSpace(body.Name)
	body.Code = strings.ToUpper(strings.TrimSpace(body.Code))
	body.Description = strings.TrimSpace(body.Description)
	body.ColorBg = strings.TrimSpace(body.ColorBg)
	body.ColorText = strings.TrimSpace(body.ColorText)

	if body.Name == "" || body.Code == "" {
		writeError(w, http.StatusBadRequest, "Nama dan Kode Kategori wajib diisi")
		return
	}

	// Ambil nama lama sebelum update untuk sync ke tabel documents
	var oldName string
	err = h.connection.QueryRow(r.Context(), `SELECT name FROM categories WHERE id = $1`, id).Scan(&oldName)
	if err != nil {
		writeError(w, http.StatusNotFound, "Kategori tidak ditemukan")
		return
	}

	res, err := h.connection.Exec(r.Context(), `
		UPDATE categories
		SET name = $1, code = $2, description = $3, color_bg = $4, color_text = $5, updated_at = NOW()
		WHERE id = $6`,
		body.Name, body.Code, body.Description, body.ColorBg, body.ColorText, id,
	)
	if err != nil {
		if strings.Contains(err.Error(), "categories_name_key") {
			writeError(w, http.StatusConflict, "Kategori dengan nama '"+body.Name+"' sudah ada")
			return
		}
		if strings.Contains(err.Error(), "categories_code_key") {
			writeError(w, http.StatusConflict, "Kode kategori '"+body.Code+"' sudah digunakan")
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui kategori: "+err.Error())
		return
	}

	if res.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Kategori tidak ditemukan")
		return
	}

	// Jika nama kategori berubah, perbarui juga dokumen terkait agar tidak putus relasi
	if oldName != body.Name {
		_, _ = h.connection.Exec(r.Context(), `
			UPDATE documents SET category = $1 WHERE category = $2`, body.Name, oldName)
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Kategori berhasil diperbarui"})
}

func (h *CategoryHandler) delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var name string
	err = h.connection.QueryRow(r.Context(), `SELECT name FROM categories WHERE id = $1`, id).Scan(&name)
	if err != nil {
		writeError(w, http.StatusNotFound, "Kategori tidak ditemukan")
		return
	}

	var docCount int
	err = h.connection.QueryRow(r.Context(), `
		SELECT COUNT(id) FROM documents WHERE category = $1 AND deleted_at IS NULL`, name).Scan(&docCount)
	if err == nil && docCount > 0 {
		writeError(w, http.StatusBadRequest, "Kategori '"+name+"' tidak dapat dihapus karena masih digunakan oleh "+strconv.Itoa(docCount)+" dokumen arsip")
		return
	}

	_, err = h.connection.Exec(r.Context(), `DELETE FROM categories WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus kategori: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Kategori berhasil dihapus"})
}
