package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Migrate menjalankan DDL untuk membuat seluruh tabel yang dibutuhkan
// (idempotent — aman dijalankan berkali-kali).
func Migrate(ctx context.Context, conn *pgxpool.Pool) error {
	ddl := `
-- ─────────────────────────────────────────────
-- MASTER: Tahun Akademik
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_years (
    id         SERIAL PRIMARY KEY,
    year       VARCHAR(9)  NOT NULL,          -- e.g. "2026/2027"
    semester   VARCHAR(6)  NOT NULL CHECK (semester IN ('Ganjil','Genap')),
    label      VARCHAR(20) NOT NULL UNIQUE,   -- e.g. "2026/2027 Ganjil"
    is_active  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default tahun akademik jika belum ada
INSERT INTO academic_years (year, semester, label, is_active) VALUES
    ('2026/2027','Ganjil','2026/2027 Ganjil', TRUE),
    ('2025/2026','Genap', '2025/2026 Genap',  FALSE),
    ('2025/2026','Ganjil','2025/2026 Ganjil', FALSE),
    ('2024/2025','Genap', '2024/2025 Genap',  FALSE),
    ('2024/2025','Ganjil','2024/2025 Ganjil', FALSE)
ON CONFLICT (label) DO NOTHING;

-- ─────────────────────────────────────────────
-- MASTER: Kriteria LAM INFOKOM Instrumen 2.1
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lam_infokom_criteria (
    code  VARCHAR(10)  PRIMARY KEY,            -- e.g. "C.1"
    title VARCHAR(255) NOT NULL
);

INSERT INTO lam_infokom_criteria (code, title) VALUES
    ('C.1','C.1 - Visi, Misi, Tujuan, dan Strategi (VMTS)'),
    ('C.2','C.2 - Tata Pamong, Tata Kelola, dan Kerjasama'),
    ('C.3','C.3 - Mahasiswa'),
    ('C.4','C.4 - Sumber Daya Manusia (SDM)'),
    ('C.5','C.5 - Keuangan, Sarana, dan Prasarana'),
    ('C.6','C.6 - Pendidikan (Kurikulum & Pembelajaran)'),
    ('C.7','C.7 - Penelitian'),
    ('C.8','C.8 - Pengabdian kepada Masyarakat (PkM)'),
    ('C.9','C.9 - Luaran dan Capaian Tridharma')
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────
-- UTAMA: Dokumen (Tabel & Alter Kolom Baru)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
    id         BIGSERIAL PRIMARY KEY,
    title      TEXT         NOT NULL,
    category   VARCHAR(100) NOT NULL,
    file_path  TEXT,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tambah kolom-kolom baru jika belum ada
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS archive_number           VARCHAR(30),
    ADD COLUMN IF NOT EXISTS document_number          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS document_date            DATE,
    ADD COLUMN IF NOT EXISTS academic_year            VARCHAR(20),
    ADD COLUMN IF NOT EXISTS nip                      VARCHAR(30),
    ADD COLUMN IF NOT EXISTS status                   VARCHAR(20) DEFAULT 'Aktif',
    ADD COLUMN IF NOT EXISTS accreditation_instrument VARCHAR(50),
    ADD COLUMN IF NOT EXISTS accreditation_criterion  VARCHAR(255),
    ADD COLUMN IF NOT EXISTS evidence_type            VARCHAR(100),
    ADD COLUMN IF NOT EXISTS file_name                VARCHAR(255),
    ADD COLUMN IF NOT EXISTS file_size                BIGINT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS mime_type                VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sha256_hash              CHAR(64),
    ADD COLUMN IF NOT EXISTS deleted_at               TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at               TIMESTAMPTZ DEFAULT NOW();

-- Backfill kolom penting untuk baris data lama (jika ada)
UPDATE documents
SET archive_number  = COALESCE(archive_number, 'ARS-2026-' || LPAD(id::text, 6, '0')),
    document_number = COALESCE(document_number, '00' || id || '/DOC/RPL/2026'),
    document_date   = COALESCE(document_date, created_at::DATE),
    academic_year   = COALESCE(academic_year, '2026/2027 Ganjil'),
    file_name       = COALESCE(file_name, title || '.pdf'),
    sha256_hash     = COALESCE(sha256_hash, MD5(id::text || title) || MD5(title || id::text)),
    status          = COALESCE(status, 'Aktif')
WHERE archive_number IS NULL;

-- Tambah UNIQUE constraint ke archive_number jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'documents_archive_number_key'
    ) THEN
        ALTER TABLE documents ADD CONSTRAINT documents_archive_number_key UNIQUE (archive_number);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_documents_category       ON documents (category);
CREATE INDEX IF NOT EXISTS idx_documents_academic_year  ON documents (academic_year);
CREATE INDEX IF NOT EXISTS idx_documents_status         ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_sha256         ON documents (sha256_hash);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at     ON documents (deleted_at);
CREATE INDEX IF NOT EXISTS idx_documents_nip            ON documents (nip);

-- ─────────────────────────────────────────────
-- Versioning: riwayat berkas per dokumen
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_versions (
    id          BIGSERIAL PRIMARY KEY,
    document_id BIGINT      NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_no  SMALLINT    NOT NULL DEFAULT 1,
    file_path   TEXT        NOT NULL,
    sha256_hash CHAR(64)    NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (document_id, version_no)
);

-- ─────────────────────────────────────────────
-- Audit Trail
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    action      VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'document',
    entity_id   BIGINT,
    detail      TEXT,
    actor_nip   VARCHAR(30),
    actor_name  VARCHAR(100),
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at  ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action      ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id   ON audit_logs (entity_id);
`
	_, err := conn.Exec(ctx, ddl)
	return err
}
