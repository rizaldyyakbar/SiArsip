package models

import "time"

type Lecturer struct {
	ID            int       `json:"id"`
	NIP           string    `json:"nip"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	Position      string    `json:"position"`
	IsActive      bool      `json:"isActive"`
	DocumentCount int       `json:"documentCount"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type CreateLecturerRequest struct {
	NIP      string `json:"nip"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Position string `json:"position"`
}

type UpdateLecturerRequest struct {
	NIP      string `json:"nip"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Position string `json:"position"`
	IsActive *bool  `json:"isActive,omitempty"`
}
