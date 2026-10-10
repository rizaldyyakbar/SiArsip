package models

import "time"

type Category struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	Code          string    `json:"code"`
	Description   string    `json:"description"`
	ColorBg       string    `json:"colorBg"`
	ColorText     string    `json:"colorText"`
	DocumentCount int       `json:"documentCount"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	ColorBg     string `json:"colorBg"`
	ColorText   string `json:"colorText"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Code        string `json:"code"`
	Description string `json:"description"`
	ColorBg     string `json:"colorBg"`
	ColorText   string `json:"colorText"`
}
