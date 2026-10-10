package models

import "time"

// DocumentVersion merepresentasikan satu riwayat versi berkas dari sebuah dokumen arsip.
type DocumentVersion struct {
	ID         int64     `json:"id"`
	DocumentID int64     `json:"documentId"`
	VersionNo  int       `json:"versionNo"`
	FilePath   string    `json:"filePath"`
	FileName   string    `json:"fileName"`
	FileSizeB  int64     `json:"fileSizeBytes"`
	MimeType   string    `json:"mimeType,omitempty"`
	SHA256Hash string    `json:"sha256Hash"`
	Note       string    `json:"note,omitempty"`
	UploadedBy string    `json:"uploadedBy,omitempty"`
	UploadedAt time.Time `json:"uploadedAt"`
}
