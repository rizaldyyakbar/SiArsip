package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	connection *pgxpool.Pool
}

func NewUserHandler(conn *pgxpool.Pool) *UserHandler {
	return &UserHandler{connection: conn}
}

func (h *UserHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /users",                 h.list)
	mux.HandleFunc("POST /users",                h.create)
	mux.HandleFunc("PUT /users/{id}",            h.update)
	mux.HandleFunc("PATCH /users/{id}/password", h.resetPassword)
	mux.HandleFunc("DELETE /users/{id}",         h.delete)
}

func (h *UserHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(), `
		SELECT id, username, name, role,
		       COALESCE(nip, ''), COALESCE(email, ''), COALESCE(phone, ''),
		       is_active, created_at, updated_at
		FROM users
		ORDER BY id ASC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil daftar pengguna: "+err.Error())
		return
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var u models.User
		if err := rows.Scan(
			&u.ID, &u.Username, &u.Name, &u.Role,
			&u.NIP, &u.Email, &u.Phone,
			&u.IsActive, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal memproses data pengguna")
			return
		}
		users = append(users, u)
	}

	writeJSON(w, http.StatusOK, users)
}

func (h *UserHandler) create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	req.Username = strings.TrimSpace(req.Username)
	req.Name = strings.TrimSpace(req.Name)
	req.Role = strings.TrimSpace(req.Role)
	req.Password = strings.TrimSpace(req.Password)

	if req.Username == "" || req.Name == "" || req.Role == "" || req.Password == "" {
		writeError(w, http.StatusBadRequest, "username, name, role, dan password wajib diisi")
		return
	}

	if req.Role != "kaprodi" && req.Role != "dosen" && req.Role != "staf_prodi" {
		writeError(w, http.StatusBadRequest, "role harus salah satu dari: kaprodi, dosen, staf_prodi")
		return
	}

	if len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "Password minimal 6 karakter")
		return
	}

	var exists bool
	_ = h.connection.QueryRow(r.Context(),
		"SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(username) = LOWER($1))", req.Username).Scan(&exists)
	if exists {
		writeError(w, http.StatusConflict, fmt.Sprintf("Username '%s' sudah digunakan", req.Username))
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengenkripsi kata sandi")
		return
	}

	var id int64
	err = h.connection.QueryRow(r.Context(), `
		INSERT INTO users (username, password_hash, name, role, nip, email, phone, is_active)
		VALUES ($1, $2, $3, $4, NULLIF($5,''), NULLIF($6,''), NULLIF($7,''), TRUE)
		RETURNING id`,
		req.Username, string(hash), req.Name, req.Role, req.NIP, req.Email, req.Phone,
	).Scan(&id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan akun pengguna: "+err.Error())
		return
	}

	writeAuditLog(r.Context(), h.connection, "CREATE", "user", &id,
		fmt.Sprintf("Akun pengguna '%s' (%s) dibuat", req.Name, req.Role), req.NIP, r.RemoteAddr)

	writeJSON(w, http.StatusCreated, map[string]any{
		"message": "Pengguna berhasil dibuat",
		"id":      id,
	})
}

func (h *UserHandler) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var req models.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Role = strings.TrimSpace(req.Role)
	if req.Role != "" && req.Role != "kaprodi" && req.Role != "dosen" && req.Role != "staf_prodi" {
		writeError(w, http.StatusBadRequest, "role harus salah satu dari: kaprodi, dosen, staf_prodi")
		return
	}

	var current models.User
	err = h.connection.QueryRow(r.Context(), `
		SELECT id, name, role, COALESCE(nip,''), COALESCE(email,''), COALESCE(phone,''), is_active
		FROM users WHERE id = $1`, id).Scan(
		&current.ID, &current.Name, &current.Role, &current.NIP, &current.Email, &current.Phone, &current.IsActive,
	)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "Pengguna tidak ditemukan")
		return
	}

	if req.Name != "" {
		current.Name = req.Name
	}
	if req.Role != "" {
		current.Role = req.Role
	}
	if req.NIP != "" {
		current.NIP = strings.TrimSpace(req.NIP)
	}
	if req.Email != "" {
		current.Email = strings.TrimSpace(req.Email)
	}
	if req.Phone != "" {
		current.Phone = strings.TrimSpace(req.Phone)
	}
	if req.IsActive != nil {
		current.IsActive = *req.IsActive
	}

	_, err = h.connection.Exec(r.Context(), `
		UPDATE users SET
			name       = $2,
			role       = $3,
			nip        = NULLIF($4, ''),
			email      = NULLIF($5, ''),
			phone      = NULLIF($6, ''),
			is_active  = $7,
			updated_at = NOW()
		WHERE id = $1`,
		id, current.Name, current.Role, current.NIP, current.Email, current.Phone, current.IsActive,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui pengguna: "+err.Error())
		return
	}

	writeAuditLog(r.Context(), h.connection, "UPDATE", "user", &id,
		fmt.Sprintf("Data akun pengguna ID %d (%s) diperbarui", id, current.Name), current.NIP, r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]any{"message": "Pengguna berhasil diperbarui", "id": id})
}

func (h *UserHandler) resetPassword(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var req models.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	if strings.TrimSpace(req.NewPassword) == "" || len(req.NewPassword) < 6 {
		writeError(w, http.StatusBadRequest, "Password baru minimal 6 karakter")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengenkripsi kata sandi")
		return
	}

	tag, err := h.connection.Exec(r.Context(),
		"UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", string(hash), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mereset kata sandi: "+err.Error())
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Pengguna tidak ditemukan")
		return
	}

	writeAuditLog(r.Context(), h.connection, "RESET_PASSWORD", "user", &id,
		fmt.Sprintf("Password akun ID %d direset", id), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Password pengguna berhasil direset"})
}

func (h *UserHandler) delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var name, nip string
	_ = h.connection.QueryRow(r.Context(), "SELECT name, COALESCE(nip,'') FROM users WHERE id = $1", id).Scan(&name, &nip)

	tag, err := h.connection.Exec(r.Context(), "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus pengguna: "+err.Error())
		return
	}
	if tag.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Pengguna tidak ditemukan")
		return
	}

	writeAuditLog(r.Context(), h.connection, "DELETE", "user", &id,
		fmt.Sprintf("Akun pengguna '%s' dihapus", name), nip, r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Pengguna berhasil dihapus"})
}
