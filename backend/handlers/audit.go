package handlers

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditHandler menangani pembacaan dan penulisan audit log.
type AuditHandler struct {
	connection *pgxpool.Pool
}

func NewAuditHandler(conn *pgxpool.Pool) *AuditHandler {
	return &AuditHandler{connection: conn}
}

func (h *AuditHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /audit-logs", h.list)
}

// list mengembalikan audit log dengan filter opsional.
func (h *AuditHandler) list(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	conditions := []string{}
	args := []any{}

	if action := strings.TrimSpace(q.Get("action")); action != "" {
		args = append(args, action)
		conditions = append(conditions, fmt.Sprintf("action = $%d", len(args)))
	}
	if actor := strings.TrimSpace(q.Get("actor_nip")); actor != "" {
		args = append(args, actor)
		conditions = append(conditions, fmt.Sprintf("actor_nip = $%d", len(args)))
	}
	if from := strings.TrimSpace(q.Get("from")); from != "" {
		args = append(args, from)
		conditions = append(conditions, fmt.Sprintf("created_at >= $%d::DATE", len(args)))
	}
	if to := strings.TrimSpace(q.Get("to")); to != "" {
		args = append(args, to)
		conditions = append(conditions, fmt.Sprintf("created_at <= ($%d::DATE + INTERVAL '1 day')", len(args)))
	}

	sqlQuery := `
		SELECT id, action, entity_type, entity_id,
		       COALESCE(detail,''), COALESCE(actor_nip,''), COALESCE(actor_name,''),
		       COALESCE(ip_address::text,''), created_at
		FROM audit_logs`

	if len(conditions) > 0 {
		sqlQuery += " WHERE " + strings.Join(conditions, " AND ")
	}
	sqlQuery += " ORDER BY created_at DESC LIMIT 200"

	rows, err := h.connection.Query(r.Context(), sqlQuery, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil audit log")
		return
	}
	defer rows.Close()

	logs := []models.AuditLog{}
	for rows.Next() {
		var al models.AuditLog
		if err := rows.Scan(
			&al.ID, &al.Action, &al.EntityType, &al.EntityID,
			&al.Detail, &al.ActorNIP, &al.ActorName, &al.IPAddress, &al.CreatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca audit log")
			return
		}
		logs = append(logs, al)
	}
	writeJSON(w, http.StatusOK, logs)
}

// writeAuditLog adalah helper yang dipakai handler lain untuk mencatat aksi.
func writeAuditLog(ctx context.Context, conn *pgxpool.Pool, action, entityType string, entityID *int64, detail, actorNIP, remoteAddr string) {
	ip := remoteAddr
	if host, _, err := net.SplitHostPort(remoteAddr); err == nil {
		ip = host
	}
	_, _ = conn.Exec(ctx, `
		INSERT INTO audit_logs (action, entity_type, entity_id, detail, actor_nip, ip_address)
		VALUES ($1, $2, $3, $4, NULLIF($5,''), NULLIF($6,''))`,
		action, entityType, entityID, detail, actorNIP, ip)
}
