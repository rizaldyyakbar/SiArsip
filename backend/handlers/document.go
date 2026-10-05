package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/arsip-prodi/siarsip/backend/storage"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// DocumentHandler menangani semua request terkait dokumen arsip.
type DocumentHandler struct {
	connection *pgxpool.Pool
	storage    storage.Local
}

func NewDocumentHandler(connection *pgxpool.Pool, fileStorage storage.Local) *DocumentHandler {
	return &DocumentHandler{connection: connection, storage: fileStorage}
}

func (h *DocumentHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /documents",                  h.list)
	mux.HandleFunc("POST /documents/upload",           h.upload)
	mux.HandleFunc("GET /documents/trash",             h.trash)
	mux.HandleFunc("GET /documents/{id}",              h.detail)
	mux.HandleFunc("GET /documents/{id}/download",     h.download)
	mux.HandleFunc("GET /documents/{id}/view",         h.view)
	mux.HandleFunc("GET /documents/{id}/preview",      h.view)
	mux.HandleFunc("PATCH /documents/{id}",            h.update)
	mux.HandleFunc("DELETE /documents/{id}",           h.softDelete)
	mux.HandleFunc("DELETE /documents/{id}/permanent", h.permanentDelete)
	mux.HandleFunc("POST /documents/{id}/restore",     h.restore)
}

// ─── LIST ────────────────────────────────────────────────────────────────────

func (h *DocumentHandler) list(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	conditions := []string{"deleted_at IS NULL"}
	args := []any{}

	if keyword := strings.TrimSpace(q.Get("query")); keyword != "" {
		args = append(args, "%"+keyword+"%")
		ph := fmt.Sprintf("$%d", len(args))
		conditions = append(conditions,
			fmt.Sprintf("(title ILIKE %s OR category ILIKE %s OR document_number ILIKE %s OR nip ILIKE %s OR accreditation_criterion ILIKE %s)", ph, ph, ph, ph, ph))
	}
	if cat := strings.TrimSpace(q.Get("category")); cat != "" {
		args = append(args, cat)
		conditions = append(conditions, fmt.Sprintf("category ILIKE $%d", len(args)))
	}
	if ay := strings.TrimSpace(q.Get("academic_year")); ay != "" {
		args = append(args, ay)
		conditions = append(conditions, fmt.Sprintf("academic_year = $%d", len(args)))
	}
	if status := strings.TrimSpace(q.Get("status")); status != "" {
		args = append(args, status)
		conditions = append(conditions, fmt.Sprintf("status = $%d", len(args)))
	}
	if criterion := strings.TrimSpace(q.Get("criterion")); criterion != "" {
		args = append(args, criterion)
		conditions = append(conditions, fmt.Sprintf("accreditation_criterion = $%d", len(args)))
	}

	sqlQuery := `
		SELECT id, archive_number, document_number, document_date::TEXT, academic_year,
		       title, category, COALESCE(nip,''), status,
		       COALESCE(accreditation_instrument,''), COALESCE(accreditation_criterion,''), COALESCE(evidence_type,''),
		       file_path, file_name, file_size, COALESCE(mime_type,''), sha256_hash,
		       deleted_at, created_at, updated_at
		FROM documents
		WHERE ` + strings.Join(conditions, " AND ") + `
		ORDER BY created_at DESC`

	rows, err := h.connection.Query(r.Context(), sqlQuery, args...)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil data dokumen: "+err.Error())
		return
	}
	defer rows.Close()

	docs := []models.Document{}
	for rows.Next() {
		var d models.Document
		if err := rows.Scan(
			&d.ID, &d.ArchiveNumber, &d.DocumentNumber, &d.DocumentDate, &d.AcademicYear,
			&d.Title, &d.Category, &d.NIP, &d.Status,
			&d.AccreditationInstrument, &d.AccreditationCriterion, &d.EvidenceType,
			&d.FilePath, &d.FileName, &d.FileSizeB, &d.MimeType, &d.SHA256Hash,
			&d.DeletedAt, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca dokumen")
			return
		}
		docs = append(docs, d)
	}
	if err := rows.Err(); err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal iterasi dokumen")
		return
	}
	writeJSON(w, http.StatusOK, docs)
}

// ─── DETAIL ──────────────────────────────────────────────────────────────────

func (h *DocumentHandler) detail(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var d models.Document
	err = h.connection.QueryRow(r.Context(), `
		SELECT id, archive_number, document_number, document_date::TEXT, academic_year,
		       title, category, COALESCE(nip,''), status,
		       COALESCE(accreditation_instrument,''), COALESCE(accreditation_criterion,''), COALESCE(evidence_type,''),
		       file_path, file_name, file_size, COALESCE(mime_type,''), sha256_hash,
		       deleted_at, created_at, updated_at
		FROM documents
		WHERE id = $1 AND deleted_at IS NULL`, id).Scan(
		&d.ID, &d.ArchiveNumber, &d.DocumentNumber, &d.DocumentDate, &d.AcademicYear,
		&d.Title, &d.Category, &d.NIP, &d.Status,
		&d.AccreditationInstrument, &d.AccreditationCriterion, &d.EvidenceType,
		&d.FilePath, &d.FileName, &d.FileSizeB, &d.MimeType, &d.SHA256Hash,
		&d.DeletedAt, &d.CreatedAt, &d.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "Dokumen tidak ditemukan")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil dokumen")
		return
	}
	writeJSON(w, http.StatusOK, d)
}

// ─── UPLOAD ──────────────────────────────────────────────────────────────────

func (h *DocumentHandler) upload(w http.ResponseWriter, r *http.Request) {
	const maxSize = 25 * 1024 * 1024 // 25 MB
	r.Body = http.MaxBytesReader(w, r.Body, maxSize)
	if err := r.ParseMultipartForm(maxSize); err != nil {
		writeError(w, http.StatusRequestEntityTooLarge, "Ukuran upload maksimal 25 MB")
		return
	}

	// ── Ambil field wajib ────────────────────────────────────────────────────
	title          := strings.TrimSpace(r.FormValue("title"))
	category       := strings.TrimSpace(r.FormValue("category"))
	documentNumber := strings.TrimSpace(r.FormValue("document_number"))
	documentDate   := strings.TrimSpace(r.FormValue("document_date"))
	academicYear   := strings.TrimSpace(r.FormValue("academic_year"))

	if title == "" || category == "" || documentNumber == "" || documentDate == "" || academicYear == "" {
		writeError(w, http.StatusBadRequest, "title, category, document_number, document_date, dan academic_year wajib diisi")
		return
	}

	// ── Validasi tahun akademik ada di master ────────────────────────────────
	var ayExists bool
	_ = h.connection.QueryRow(r.Context(),
		"SELECT EXISTS(SELECT 1 FROM academic_years WHERE label = $1)", academicYear).Scan(&ayExists)
	if !ayExists {
		writeError(w, http.StatusBadRequest, "academic_year tidak ditemukan dalam master data")
		return
	}

	// ── Field opsional ───────────────────────────────────────────────────────
	nip                    := strings.TrimSpace(r.FormValue("nip"))
	status                 := strings.TrimSpace(r.FormValue("status"))
	accreditationInstrument := strings.TrimSpace(r.FormValue("accreditation_instrument"))
	accreditationCriterion  := strings.TrimSpace(r.FormValue("accreditation_criterion"))
	evidenceType            := strings.TrimSpace(r.FormValue("evidence_type"))

	if status == "" {
		status = "Aktif"
	}

	// ── File ────────────────────────────────────────────────────────────────
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "File wajib diunggah dengan field 'file'")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowed := map[string]bool{".pdf": true, ".docx": true, ".xlsx": true, ".zip": true, ".csv": true}
	if !allowed[ext] {
		writeError(w, http.StatusBadRequest, "Format file harus PDF, DOCX, XLSX, ZIP, atau CSV")
		return
	}

	// ── Hitung SHA-256 (baca ke buffer dulu) ────────────────────────────────
	content, err := io.ReadAll(file)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal membaca isi file")
		return
	}
	hashBytes := sha256.Sum256(content)
	sha256Hash := hex.EncodeToString(hashBytes[:])

	// ── Cek duplikasi SHA-256 (hanya untuk dokumen Aktif) ───────────────────
	var existingID int64
	err = h.connection.QueryRow(r.Context(),
		"SELECT id FROM documents WHERE sha256_hash = $1 AND deleted_at IS NULL", sha256Hash).Scan(&existingID)
	if err == nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusConflict)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error":       "Berkas dengan konten identik sudah tersimpan dalam sistem",
			"existing_id": existingID,
			"sha256":      sha256Hash,
		})
		return
	}

	// ── Simpan file ke storage ───────────────────────────────────────────────
	storedPath, err := h.storage.SaveBytes(content, ext)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan file ke storage")
		return
	}

	// ── Generate archive_number ──────────────────────────────────────────────
	year := time.Now().Year()
	var seq int64
	_ = h.connection.QueryRow(r.Context(),
		"SELECT COUNT(*)+1 FROM documents WHERE EXTRACT(YEAR FROM created_at) = $1", year).Scan(&seq)
	archiveNumber := fmt.Sprintf("ARS-%d-%06d", year, seq)

	// ── Simpan ke database ───────────────────────────────────────────────────
	var docID int64
	err = h.connection.QueryRow(r.Context(), `
		INSERT INTO documents (
			archive_number, document_number, document_date, academic_year,
			title, category, nip, status,
			accreditation_instrument, accreditation_criterion, evidence_type,
			file_path, file_name, file_size, sha256_hash
		) VALUES ($1,$2,$3::DATE,$4,$5,$6,NULLIF($7,''),$8,NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),$12,$13,$14,$15)
		RETURNING id`,
		archiveNumber, documentNumber, documentDate, academicYear,
		title, category, nip, status,
		accreditationInstrument, accreditationCriterion, evidenceType,
		storedPath, header.Filename, header.Size, sha256Hash,
	).Scan(&docID)
	if err != nil {
		_ = h.storage.Remove(storedPath)
		writeError(w, http.StatusInternalServerError, "Gagal menyimpan metadata dokumen: "+err.Error())
		return
	}

	// ── Audit log ───────────────────────────────────────────────────────────
	writeAuditLog(r.Context(), h.connection, "UPLOAD", "document", &docID,
		fmt.Sprintf("Dokumen '%s' (%s) diunggah", title, archiveNumber), nip, r.RemoteAddr)

	writeJSON(w, http.StatusCreated, map[string]any{
		"id":             docID,
		"archive_number": archiveNumber,
		"document_number": documentNumber,
		"title":          title,
		"category":       category,
		"sha256_hash":    sha256Hash,
		"status":         status,
	})
}

// ─── UPDATE METADATA ─────────────────────────────────────────────────────────

func (h *DocumentHandler) update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var body struct {
		Title                   string `json:"title"`
		Category                string `json:"category"`
		NIP                     string `json:"nip"`
		Status                  string `json:"status"`
		DocumentNumber          string `json:"document_number"`
		DocumentDate            string `json:"document_date"`
		AcademicYear            string `json:"academic_year"`
		AccreditationInstrument string `json:"accreditation_instrument"`
		AccreditationCriterion  string `json:"accreditation_criterion"`
		EvidenceType            string `json:"evidence_type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "Body JSON tidak valid")
		return
	}

	_, err = h.connection.Exec(r.Context(), `
		UPDATE documents SET
			title                    = COALESCE(NULLIF($2,''), title),
			category                 = COALESCE(NULLIF($3,''), category),
			nip                      = COALESCE(NULLIF($4,''), nip),
			status                   = COALESCE(NULLIF($5,''), status),
			document_number          = COALESCE(NULLIF($6,''), document_number),
			document_date            = COALESCE(NULLIF($7,'')::DATE, document_date),
			academic_year            = COALESCE(NULLIF($8,''), academic_year),
			accreditation_instrument = COALESCE(NULLIF($9,''), accreditation_instrument),
			accreditation_criterion  = COALESCE(NULLIF($10,''), accreditation_criterion),
			evidence_type            = COALESCE(NULLIF($11,''), evidence_type),
			updated_at               = NOW()
		WHERE id = $1 AND deleted_at IS NULL`,
		id, body.Title, body.Category, body.NIP, body.Status,
		body.DocumentNumber, body.DocumentDate, body.AcademicYear,
		body.AccreditationInstrument, body.AccreditationCriterion, body.EvidenceType,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memperbarui dokumen")
		return
	}

	writeAuditLog(r.Context(), h.connection, "UPDATE", "document", &id,
		fmt.Sprintf("Metadata dokumen ID %d diperbarui", id), body.NIP, r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]any{"message": "Dokumen berhasil diperbarui", "id": id})
}

// ─── SOFT DELETE ─────────────────────────────────────────────────────────────

func (h *DocumentHandler) softDelete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	_, err = h.connection.Exec(r.Context(),
		"UPDATE documents SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus dokumen")
		return
	}

	writeAuditLog(r.Context(), h.connection, "DELETE", "document", &id,
		fmt.Sprintf("Dokumen ID %d dipindahkan ke tempat sampah", id), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]any{"message": "Dokumen dipindahkan ke tempat sampah", "id": id})
}

// ─── TRASH ───────────────────────────────────────────────────────────────────

func (h *DocumentHandler) trash(w http.ResponseWriter, r *http.Request) {
	rows, err := h.connection.Query(r.Context(), `
		SELECT id, archive_number, document_number, document_date::TEXT, academic_year,
		       title, category, COALESCE(nip,''), status,
		       COALESCE(accreditation_instrument,''), COALESCE(accreditation_criterion,''), COALESCE(evidence_type,''),
		       file_path, file_name, file_size, COALESCE(mime_type,''), sha256_hash,
		       deleted_at, created_at, updated_at
		FROM documents
		WHERE deleted_at IS NOT NULL
		ORDER BY deleted_at DESC`)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil tempat sampah")
		return
	}
	defer rows.Close()

	docs := []models.Document{}
	for rows.Next() {
		var d models.Document
		if err := rows.Scan(
			&d.ID, &d.ArchiveNumber, &d.DocumentNumber, &d.DocumentDate, &d.AcademicYear,
			&d.Title, &d.Category, &d.NIP, &d.Status,
			&d.AccreditationInstrument, &d.AccreditationCriterion, &d.EvidenceType,
			&d.FilePath, &d.FileName, &d.FileSizeB, &d.MimeType, &d.SHA256Hash,
			&d.DeletedAt, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			writeError(w, http.StatusInternalServerError, "Gagal membaca tempat sampah")
			return
		}
		docs = append(docs, d)
	}
	writeJSON(w, http.StatusOK, docs)
}

// ─── SERVE FILE (VIEW OR DOWNLOAD) ──────────────────────────────────────────

func getMimeType(fileName string, storedMime string) string {
	if storedMime != "" && storedMime != "application/octet-stream" {
		return storedMime
	}
	ext := strings.ToLower(filepath.Ext(fileName))
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".txt":
		return "text/plain; charset=utf-8"
	case ".csv":
		return "text/csv; charset=utf-8"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".xlsx":
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case ".zip":
		return "application/zip"
	default:
		return "application/octet-stream"
	}
}

func (h *DocumentHandler) serveFile(w http.ResponseWriter, r *http.Request, isAttachment bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var filePath, fileName, mimeType string
	err = h.connection.QueryRow(r.Context(),
		"SELECT file_path, file_name, COALESCE(mime_type, '') FROM documents WHERE id = $1", id).
		Scan(&filePath, &fileName, &mimeType)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "Dokumen tidak ditemukan")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal mengambil dokumen")
		return
	}

	// Normalisasi path relatif vs absolut
	actualPath := filePath
	if strings.HasPrefix(actualPath, "/uploads/") {
		actualPath = strings.TrimPrefix(actualPath, "/")
	}
	if !filepath.IsAbs(actualPath) {
		if _, err := os.Stat(actualPath); os.IsNotExist(err) {
			// Coba di direktori uploads
			altPath := filepath.Join("uploads", filepath.Base(actualPath))
			if _, err := os.Stat(altPath); err == nil {
				actualPath = altPath
			}
		}
	}

	// Pastikan file fisik ada di disk
	if _, err := os.Stat(actualPath); os.IsNotExist(err) {
		writeError(w, http.StatusNotFound, "Berkas fisik dokumen belum tersedia di server penyimpanan")
		return
	}

	detectedMime := getMimeType(fileName, mimeType)

	dispositionType := "inline"
	if isAttachment {
		dispositionType = "attachment"
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf(`%s; filename="%s"`, dispositionType, fileName))
	w.Header().Set("Content-Type", detectedMime)
	w.Header().Set("X-Content-Type-Options", "nosniff")

	http.ServeFile(w, r, actualPath)

	action := "DOWNLOAD"
	detail := fmt.Sprintf("Dokumen '%s' diunduh", fileName)
	if !isAttachment {
		action = "VIEW"
		detail = fmt.Sprintf("Dokumen '%s' dilihat (pratinjau)", fileName)
	}
	writeAuditLog(r.Context(), h.connection, action, "document", &id, detail, "", r.RemoteAddr)
}

func (h *DocumentHandler) download(w http.ResponseWriter, r *http.Request) {
	h.serveFile(w, r, true)
}

func (h *DocumentHandler) view(w http.ResponseWriter, r *http.Request) {
	h.serveFile(w, r, false)
}

// ─── PERMANENT DELETE ────────────────────────────────────────────────────────

func (h *DocumentHandler) permanentDelete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	var filePath, title string
	err = h.connection.QueryRow(r.Context(),
		"SELECT file_path, title FROM documents WHERE id = $1 AND deleted_at IS NOT NULL", id).
		Scan(&filePath, &title)
	if err == pgx.ErrNoRows {
		writeError(w, http.StatusNotFound, "Dokumen tidak ditemukan di tempat sampah")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memproses penghapusan permanen")
		return
	}

	_, err = h.connection.Exec(r.Context(), "DELETE FROM documents WHERE id = $1", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal menghapus dokumen secara permanen")
		return
	}

	// Hapus file fisik dari storage jika tidak ada referensi lain
	var count int
	_ = h.connection.QueryRow(r.Context(), "SELECT COUNT(*) FROM documents WHERE file_path = $1", filePath).Scan(&count)
	if count == 0 {
		_ = h.storage.Remove(filePath)
	}

	writeAuditLog(r.Context(), h.connection, "PERMANENT_DELETE", "document", &id,
		fmt.Sprintf("Dokumen '%s' (ID %d) dihapus permanen", title, id), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]any{"message": "Dokumen berhasil dihapus permanen", "id": id})
}

// ─── RESTORE ─────────────────────────────────────────────────────────────────

func (h *DocumentHandler) restore(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "ID tidak valid")
		return
	}

	_, err = h.connection.Exec(r.Context(),
		"UPDATE documents SET deleted_at = NULL, status = 'Aktif', updated_at = NOW() WHERE id = $1 AND deleted_at IS NOT NULL", id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "Gagal memulihkan dokumen")
		return
	}

	writeAuditLog(r.Context(), h.connection, "RESTORE", "document", &id,
		fmt.Sprintf("Dokumen ID %d dipulihkan dari tempat sampah", id), "", r.RemoteAddr)

	writeJSON(w, http.StatusOK, map[string]any{"message": "Dokumen berhasil dipulihkan", "id": id})
}

// ─── Helper ──────────────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
