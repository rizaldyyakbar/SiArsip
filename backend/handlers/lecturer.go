package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LecturerHandler struct {
	connection *pgxpool.Pool
}

func NewLecturerHandler(conn *pgxpool.Pool) *LecturerHandler {
	return &LecturerHandler{connection: conn}
}

func (h *LecturerHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /lecturers", h.list)
	mux.HandleFunc("POST /lecturers", h.create)
	mux.HandleFunc("PUT /lecturers/{id}", h.update)
	mux.HandleFunc("PATCH /lecturers/{id}/status", h.toggleStatus)
	mux.HandleFunc("DELETE /lecturers/{id}", h.delete)
}

func (h *LecturerHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(), `
		SELECT l.id, l.nip, l.name, COALESCE(l.email, ''), COALESCE(l.phone, ''),
		       COALESCE(l.position, ''), l.is_active, l.created_at, l.updated_at,
		       COUNT(d.id) AS document_count
		FROM lecturers l
		LEFT JOIN documents d ON (d.nip = l.nip) AND d.deleted_at IS NULL
		GROUP BY l.id, l.nip, l.name, l.email, l.phone, l.position, l.is_active, l.created_at, l.updated_at
		ORDER BY l.name ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data dosen: "+err.Error())
		return
	}
	defer rows.Close()

	lecturers := []models.Lecturer{}
	for rows.Next() {
		var l models.Lecturer
		if err := rows.Scan(
			&l.ID, &l.NIP, &l.Name, &l.Email, &l.Phone,
			&l.Position, &l.IsActive, &l.CreatedAt, &l.UpdatedAt,
			&l.DocumentCount,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca data dosen: "+err.Error())
			return
		}
		lecturers = append(lecturers, l)
	}

	writeJSON(w, http.StatusOK, lecturers)
}

func (h *LecturerHandler) create(w http.ResponseWriter, r *http.Request) {
	var body models.CreateLecturerRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	body.NIP = strings.TrimSpace(body.NIP)
	body.Name = strings.TrimSpace(body.Name)
	body.Email = strings.TrimSpace(body.Email)
	body.Phone = strings.TrimSpace(body.Phone)
	body.Position = strings.TrimSpace(body.Position)

	if body.NIP == "" || body.Name == "" {
		writeError(w, http.StatusBadRequest, "NIP dan Nama Dosen wajib diisi")
		return
	}
	if body.Position == "" {
		body.Position = "Dosen Tetap RPL"
	}

	var id int
	err := h.connection.QueryRow(r.Context(), `
		INSERT INTO lecturers (nip, name, email, phone, position, is_active)
		VALUES ($1, $2, $3, $4, $5, TRUE)
		RETURNING id`,
		body.NIP, body.Name, body.Email, body.Phone, body.Position,
	).Scan(&id)

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "lecturers_nip_key") {
			writeError(w, http.StatusConflict, "Dosen dengan NIP '"+body.NIP+"' sudah terdaftar")
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal menambahkan dosen: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":      id,
		"message": "Dosen berhasil ditambahkan",
	})
}

func (h *LecturerHandler) update(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var body models.UpdateLecturerRequest
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	body.NIP = strings.TrimSpace(body.NIP)
	body.Name = strings.TrimSpace(body.Name)
	body.Email = strings.TrimSpace(body.Email)
	body.Phone = strings.TrimSpace(body.Phone)
	body.Position = strings.TrimSpace(body.Position)

	if body.NIP == "" || body.Name == "" {
		writeError(w, http.StatusBadRequest, "NIP dan Nama Dosen wajib diisi")
		return
	}

	res, err := h.connection.Exec(r.Context(), `
		UPDATE lecturers
		SET nip = $1, name = $2, email = $3, phone = $4, position = $5, updated_at = NOW()
		WHERE id = $6`,
		body.NIP, body.Name, body.Email, body.Phone, body.Position, id,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			writeError(w, http.StatusConflict, "Dosen dengan NIP '"+body.NIP+"' sudah digunakan oleh dosen lain")
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui dosen: "+err.Error())
		return
	}

	if res.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Data dosen tidak ditemukan")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Data dosen berhasil diperbarui"})
}

func (h *LecturerHandler) toggleStatus(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var isActive bool
	err = h.connection.QueryRow(r.Context(), `
		UPDATE lecturers
		SET is_active = NOT is_active, updated_at = NOW()
		WHERE id = $1
		RETURNING is_active`, id).Scan(&isActive)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengubah status dosen: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"id":       id,
		"isActive": isActive,
		"message":  "Status keaktifan dosen berhasil diperbarui",
	})
}

func (h *LecturerHandler) delete(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	// Cek apakah ada berkas yang mengacu pada NIP dosen ini
	var nip string
	err = h.connection.QueryRow(r.Context(), `SELECT nip FROM lecturers WHERE id = $1`, id).Scan(&nip)
	if err != nil {
		writeError(w, http.StatusNotFound, "Dosen tidak ditemukan")
		return
	}

	var docCount int
	err = h.connection.QueryRow(r.Context(), `
		SELECT COUNT(id) FROM documents WHERE nip = $1 AND deleted_at IS NULL`, nip).Scan(&docCount)
	if err == nil && docCount > 0 {
		writeError(w, http.StatusBadRequest, "Tidak dapat menghapus dosen karena masih memiliki "+strconv.Itoa(docCount)+" berkas arsip aktif")
		return
	}

	_, err = h.connection.Exec(r.Context(), `DELETE FROM lecturers WHERE id = $1`, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus dosen: "+err.Error())
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Data dosen berhasil dihapus"})
}
