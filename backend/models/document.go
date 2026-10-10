package models

import "time"

// Document merepresentasikan satu berkas arsip digital.
type Document struct {
	ID             int64      `json:"id"`
	ArchiveNumber  string     `json:"archive_number"`
	DocumentNumber string     `json:"document_number"`
	DocumentDate   string     `json:"document_date"` // YYYY-MM-DD
	AcademicYear   string     `json:"academic_year"` // e.g. "2026/2027 Ganjil"

	Title    string `json:"title"`
	Category string `json:"category"`
	NIP      string `json:"nip,omitempty"`
	Status   string `json:"status"` // Aktif | Draft | Tertunda

	// Akreditasi LAM INFOKOM (opsional)
	AccreditationInstrument string `json:"accreditation_instrument,omitempty"`
	AccreditationCriterion  string `json:"accreditation_criterion,omitempty"`
	EvidenceType            string `json:"evidence_type,omitempty"`

	// File
	FilePath   string `json:"file_path"`
	FileName   string `json:"file_name"`
	FileSizeB  int64  `json:"file_size_bytes"`
	MimeType   string `json:"mime_type,omitempty"`
	SHA256Hash string `json:"sha256_hash"`

	// Timestamps
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// AcademicYear merepresentasikan master data tahun akademik.
type AcademicYear struct {
	ID        int    `json:"id"`
	Year      string `json:"year"`
	Semester  string `json:"semester"`
	Label     string `json:"label"`
	IsActive  bool   `json:"is_active"`
	DocCount  int    `json:"doc_count,omitempty"`
}

// LamInfokomCriterion merepresentasikan kriteria akreditasi LAM INFOKOM 2.1.
type LamInfokomCriterion struct {
	Code  string `json:"code"`
	Title string `json:"title"`
}

// AuditLog mencatat setiap aksi yang terjadi dalam sistem.
type AuditLog struct {
	ID         int64      `json:"id"`
	Action     string     `json:"action"`
	EntityType string     `json:"entity_type"`
	EntityID   *int64     `json:"entity_id,omitempty"`
	Detail     string     `json:"detail,omitempty"`
	ActorNIP   string     `json:"actor_nip,omitempty"`
	ActorName  string     `json:"actor_name,omitempty"`
	IPAddress  string     `json:"ip_address,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}
