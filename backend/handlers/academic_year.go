package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5"
)

// AcademicYearHandler menangani master data tahun akademik.
type AcademicYearHandler struct {
	connection *pgx.Conn
}

func NewAcademicYearHandler(conn *pgx.Conn) *AcademicYearHandler {
	return &AcademicYearHandler{connection: conn}
}

func (h *AcademicYearHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /academic-years",        h.list)
	mux.HandleFunc("POST /academic-years",       h.create)
	mux.HandleFunc("PATCH /academic-years/{id}", h.update)
	mux.HandleFunc("DELETE /academic-years/{id}", h.delete)
}

// list mengembalikan semua master tahun akademik beserta jumlah dokumen terkait.
func (h *AcademicYearHandler) list(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(), `
		SELECT a.id, a.year, a.semester, a.label, a.is_active,
		       COUNT(d.id) AS doc_count
		FROM academic_years a
		LEFT JOIN documents d ON d.academic_year = a.label AND d.deleted_at IS NULL
		GROUP BY a.id, a.year, a.semester, a.label, a.is_active
		ORDER BY a.id DESC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data tahun akademik")
		return
	}
	defer rows.Close()

	years := []models.AcademicYear{}
	for rows.Next() {
		var ay models.AcademicYear
		if err := rows.Scan(&ay.ID, &ay.Year, &ay.Semester, &ay.Label, &ay.IsActive, &ay.DocCount); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca tahun akademik")
			return
		}
		years = append(years, ay)
	}
	writeJSON(w, http.StatusOK, years)
}

// create menambahkan tahun akademik baru ke master data.
func (h *AcademicYearHandler) create(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Year     string `json:"year"`
		Semester string `json:"semester"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}
	body.Year = strings.TrimSpace(body.Year)
	body.Semester = strings.TrimSpace(body.Semester)
	if body.Year == "" || body.Semester == "" {
		writeError(w, http.StatusBadRequest, "year dan semester wajib diisi")
		return
	}
	if body.Semester != "Ganjil" && body.Semester != "Genap" {
		writeError(w, http.StatusBadRequest, "semester harus 'Ganjil' atau 'Genap'")
		return
	}

	label := body.Year + " " + body.Semester
	var id int
	err := h.connection.QueryRow(r.Context(), `
		INSERT INTO academic_years (year, semester, label) VALUES ($1,$2,$3) RETURNING id`,
		body.Year, body.Semester, label).Scan(&id)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			writeError(w, http.StatusConflict, "Tahun akademik '"+label+"' sudah ada")
			return
		}
		writeError(w, http.StatusInternalServerError, "Gagal menambah tahun akademik: "+err.Error())
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"id": id, "label": label})
}

// update mengubah status is_active tahun akademik.
func (h *AcademicYearHandler) update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var body struct {
		IsActive bool `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	_, err := h.connection.Exec(r.Context(),
		"UPDATE academic_years SET is_active = $1 WHERE id = $2", body.IsActive, id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui tahun akademik")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "Tahun akademik diperbarui"})
}

// delete menghapus tahun akademik jika belum digunakan oleh dokumen.
func (h *AcademicYearHandler) delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var docCount int
	err := h.connection.QueryRow(r.Context(), `
		SELECT COUNT(*) FROM documents 
		WHERE academic_year = (SELECT label FROM academic_years WHERE id = $1)
		  AND deleted_at IS NULL`, id).Scan(&docCount)
	if err == nil && docCount > 0 {
		writeError(w, http.StatusConflict, "Tahun akademik tidak dapat dihapus karena masih digunakan oleh dokumen arsip")
		return
	}

	res, err := h.connection.Exec(r.Context(), "DELETE FROM academic_years WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus tahun akademik: "+err.Error())
		return
	}
	if res.RowsAffected() == 0 {
		writeError(w, http.StatusNotFound, "Tahun akademik tidak ditemukan")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"message": "Tahun akademik berhasil dihapus"})
}
