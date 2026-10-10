package handlers

import (
	"net/http"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type StatsHandler struct {
	connection *pgxpool.Pool
}

func NewStatsHandler(conn *pgxpool.Pool) *StatsHandler {
	return &StatsHandler{connection: conn}
}

func (h *StatsHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /dashboard/stats", h.getDashboardStats)
}

func (h *StatsHandler) getDashboardStats(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var stats models.DashboardStats

	// Total active documents & storage bytes
	_ = h.connection.QueryRow(ctx, `
		SELECT COUNT(*), COALESCE(SUM(file_size), 0)
		FROM documents
		WHERE deleted_at IS NULL`).Scan(&stats.TotalDocuments, &stats.TotalStorageByte)

	// Total trash
	_ = h.connection.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM documents
		WHERE deleted_at IS NOT NULL`).Scan(&stats.TotalTrash)

	// Total categories
	_ = h.connection.QueryRow(ctx, `SELECT COUNT(*) FROM categories`).Scan(&stats.TotalCategories)

	// Total lecturers
	_ = h.connection.QueryRow(ctx, `SELECT COUNT(*) FROM lecturers WHERE is_active = TRUE`).Scan(&stats.TotalLecturers)

	// Active academic year
	_ = h.connection.QueryRow(ctx, `
		SELECT label FROM academic_years WHERE is_active = TRUE ORDER BY id DESC LIMIT 1`).Scan(&stats.ActiveYear)

	// Breakdown by category
	catRows, err := h.connection.Query(ctx, `
		SELECT c.name, COUNT(d.id)
		FROM categories c
		LEFT JOIN documents d ON d.category = c.name AND d.deleted_at IS NULL
		GROUP BY c.name
		ORDER BY COUNT(d.id) DESC, c.name ASC`)
	if err == nil {
		defer catRows.Close()
		for catRows.Next() {
			var cs models.CategoryStat
			if err := catRows.Scan(&cs.Category, &cs.Count); err == nil {
				stats.ByCategory = append(stats.ByCategory, cs)
			}
		}
	}

	// Breakdown by LAM INFOKOM criteria
	critRows, err := h.connection.Query(ctx, `
		SELECT c.code, c.title, COUNT(d.id)
		FROM lam_infokom_criteria c
		LEFT JOIN documents d ON (d.accreditation_criterion ILIKE c.code || '%' OR d.accreditation_criterion = c.title) AND d.deleted_at IS NULL
		GROUP BY c.code, c.title
		ORDER BY c.code ASC`)
	if err == nil {
		defer critRows.Close()
		for critRows.Next() {
			var cr models.CriteriaStat
			if err := critRows.Scan(&cr.Code, &cr.Title, &cr.Count); err == nil {
				stats.ByCriteria = append(stats.ByCriteria, cr)
			}
		}
	}

	if stats.ByCategory == nil {
		stats.ByCategory = []models.CategoryStat{}
	}
	if stats.ByCriteria == nil {
		stats.ByCriteria = []models.CriteriaStat{}
	}

	writeJSON(w, http.StatusOK, stats)
}
