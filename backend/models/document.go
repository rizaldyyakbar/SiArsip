package models

import "time"

type Document struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Category  string    `json:"category"`
	Year      int       `json:"year"`
	FilePath  string    `json:"file_path"`
	CreatedAt time.Time `json:"created_at"`
}
