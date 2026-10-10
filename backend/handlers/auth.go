package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/auth"
	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	connection *pgxpool.Pool
}

func NewAuthHandler(conn *pgxpool.Pool) *AuthHandler {
	return &AuthHandler{connection: conn}
}

func (h *AuthHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /auth/login",           h.login)
	mux.HandleFunc("GET /auth/me",               h.me)
	mux.HandleFunc("POST /auth/logout",          h.logout)
	mux.HandleFunc("POST /auth/change-password", h.changePassword)
}

// login menangani autentikasi pengguna dengan username atau NIP dan password.
func (h *AuthHandler) login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	identifier := strings.TrimSpace(req.Username)
	password := strings.TrimSpace(req.Password)
	if identifier == "" || password == "" {
		writeError(w, http.StatusBadRequest, "Username/NIP dan password wajib diisi")
		return
	}

	var u models.User
	var passwordHash string

	err := h.connection.QueryRow(r.Context(), `
		SELECT id, username, password_hash, name, role,
		       COALESCE(nip, ''), COALESCE(email, ''), COALESCE(phone, ''),
		       is_active, created_at, updated_at
		FROM users
		WHERE LOWER(username) = LOWER($1) OR (nip = $1 AND nip != '')
		LIMIT 1`, identifier).Scan(
		&u.ID, &u.Username, &passwordHash, &u.Name, &u.Role,
		&u.NIP, &u.Email, &u.Phone,
		&u.IsActive, &u.CreatedAt, &u.UpdatedAt,
	)

	if err == pgx.ErrNoRows {
		writeError(w, http.StatusUnauthorized, "Username/NIP atau password salah")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memproses autentikasi")
		return
	}

	if !u.IsActive {
		writeError(w, http.StatusForbidden, "Akun ini telah dinonaktifkan. Hubungi staf prodi.")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(password)); err != nil {
		writeError(w, http.StatusUnauthorized, "Username/NIP atau password salah")
		return
	}

	token, err := auth.GenerateToken(u)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menerbitkan token keamanan")
		return
	}

	writeAuditLog(r.Context(), h.connection, "LOGIN", "user", &u.ID,
		fmt.Sprintf("User '%s' (%s) berhasil masuk", u.Name, u.Role), u.NIP, r.RemoteAddr)

	writeJSON(w, http.StatusOK, models.LoginResponse{
		Token: token,
		User:  u,
	})
}

// me mengembalikan profil user yang saat ini sedang login via token JWT.
func (h *AuthHandler) me(w http.ResponseWriter, r *http.Request) {
	tokenStr := auth.ExtractBearerToken(r.Header.Get("Authorization"))
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Sesi tidak valid atau telah kedaluwarsa: "+err.Error())
		return
	}

	var u models.User
	err = h.connection.QueryRow(r.Context(), `
		SELECT id, username, name, role,
		       COALESCE(nip, ''), COALESCE(email, ''), COALESCE(phone, ''),
		       is_active, created_at, updated_at
		FROM users
		WHERE id = $1`, claims.UserID).Scan(
		&u.ID, &u.Username, &u.Name, &u.Role,
		&u.NIP, &u.Email, &u.Phone,
		&u.IsActive, &u.CreatedAt, &u.UpdatedAt,
	)

	if err != nil {
		writeError(w, http.StatusNotFound, "Data pengguna tidak ditemukan")
		return
	}

	if !u.IsActive {
		writeError(w, http.StatusForbidden, "Akun telah dinonaktifkan")
		return
	}

	writeJSON(w, http.StatusOK, u)
}

// logout mencatat audit log saat pengguna keluar.
func (h *AuthHandler) logout(w http.ResponseWriter, r *http.Request) {
	tokenStr := auth.ExtractBearerToken(r.Header.Get("Authorization"))
	if claims, err := auth.ValidateToken(tokenStr); err == nil {
		writeAuditLog(r.Context(), h.connection, "LOGOUT", "user", &claims.UserID,
			fmt.Sprintf("User '%s' keluar dari sistem", claims.Name), claims.NIP, r.RemoteAddr)
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "Berhasil keluar dari sistem"})
}

// changePassword menangani perubahan kata sandi mandiri pengguna.
func (h *AuthHandler) changePassword(w http.ResponseWriter, r *http.Request) {
	tokenStr := auth.ExtractBearerToken(r.Header.Get("Authorization"))
	claims, err := auth.ValidateToken(tokenStr)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "Sesi tidak valid")
		return
	}

	var req models.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	if strings.TrimSpace(req.NewPassword) == "" || len(req.NewPassword) < 6 {
		writeError(w, http.StatusBadRequest, "Password baru minimal 6 karakter")
		return
	}

	var currentHash string
	err = h.connection.QueryRow(r.Context(),
		"SELECT password_hash FROM users WHERE id = $1", claims.UserID).Scan(&currentHash)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memuat data akun")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.OldPassword)); err != nil {
		writeError(w, http.StatusBadRequest, "Password lama salah")
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengenkripsi kata sandi baru")
		return
	}

	_, err = h.connection.Exec(r.Context(),
		"UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", string(newHash), claims.UserID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui kata sandi")
		return
	}

	writeAuditLog(r.Context(), h.connection, "CHANGE_PASSWORD", "user", &claims.UserID,
		fmt.Sprintf("User '%s' mengganti kata sandi", claims.Name), claims.NIP, r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]string{"message": "Password berhasil diperbarui"})
}
