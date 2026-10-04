package handlers

import (
	"net/http"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5"
)

// CriteriaHandler menangani daftar kriteria LAM INFOKOM Instrumen 2.1.
type CriteriaHandler struct {
	connection *pgx.Conn
}

func NewCriteriaHandler(conn *pgx.Conn) *CriteriaHandler {
	return &CriteriaHandler{connection: conn}
}

func (h *CriteriaHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /criteria", h.list)
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
