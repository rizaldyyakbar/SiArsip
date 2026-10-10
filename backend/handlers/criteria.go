package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CriteriaHandler menangani daftar kriteria LAM INFOKOM Instrumen 2.1.
type CriteriaHandler struct {
	connection *pgxpool.Pool
}

func NewCriteriaHandler(conn *pgxpool.Pool) *CriteriaHandler {
	return &CriteriaHandler{connection: conn}
}

func (h *CriteriaHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /criteria",         h.list)
	mux.HandleFunc("POST /criteria",        h.create)
	mux.HandleFunc("PUT /criteria/{code}",  h.update)
	mux.HandleFunc("DELETE /criteria/{code}", h.delete)
}

// list mengembalikan seluruh kriteria LAM INFOKOM dari master data.
func (h *CriteriaHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(),
		"SELECT code, title FROM lam_infokom_criteria ORDER BY code")
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil kriteria LAM INFOKOM")
		return
	}
	defer rows.Close()

	criteria := []models.LamInfokomCriterion{}
	for rows.Next() {
		var c models.LamInfokomCriterion
		if err := rows.Scan(&c.Code, &c.Title); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca kriteria")
			return
		}
		criteria = append(criteria, c)
	}
	writeJSON(w, http.StatusOK, criteria)
}

func (h *CriteriaHandler) create(w http.ResponseWriter, r *http.Request) {
	var c models.LamInfokomCriterion
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}
	c.Code = strings.TrimSpace(c.Code)
	c.Title = strings.TrimSpace(c.Title)
	if c.Code == "" || c.Title == "" {
		writeError(w, http.StatusBadRequest, "code dan title wajib diisi")
		return
	}

	_, err := h.connection.Exec(r.Context(),
		"INSERT INTO lam_infokom_criteria (code, title) VALUES ($1, $2)", c.Code, c.Title)
	if err != nil {
		writeError(w, http.StatusBadRequest, "Gagal menambah kriteria (mungkin kode sudah ada): "+err.Error())
		return
	}

	writeAuditLog(r.Context(), h.connection, "CREATE", "criteria", nil,
		fmt.Sprintf("Kriteria '%s' ditambahkan", c.Title), "", r.RemoteAddr)

	writeJSON(w, http.StatusCreated, c)
}

func (h *CriteriaHandler) update(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")
	var body struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}
	body.Title = strings.TrimSpace(body.Title)
	if body.Title == "" {
		writeError(w, http.StatusBadRequest, "title tidak boleh kosong")
		return
	}

	tag, err := h.connection.Exec(r.Context(),
		"UPDATE lam_infokom_criteria SET title = $2 WHERE code = $1", code, body.Title)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui kriteria: "+err.Error())
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Kriteria tidak ditemukan")
		return
	}

	writeAuditLog(r.Context(), h.connection, "UPDATE", "criteria", nil,
		fmt.Sprintf("Kriteria '%s' diperbarui", code), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Kriteria berhasil diperbarui", "code": code})
}

func (h *CriteriaHandler) delete(w http.ResponseWriter, r *http.Request) {
	code := r.PathValue("code")
	tag, err := h.connection.Exec(r.Context(),
		"DELETE FROM lam_infokom_criteria WHERE code = $1", code)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus kriteria: "+err.Error())
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Kriteria tidak ditemukan")
		return
	}

	writeAuditLog(r.Context(), h.connection, "DELETE", "criteria", nil,
		fmt.Sprintf("Kriteria '%s' dihapus", code), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Kriteria berhasil dihapus"})
}

