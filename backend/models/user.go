package models

import "time"

// User merepresentasikan akun pengguna sistem SiArsip.
type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Name      string    `json:"name"`
	Role      string    `json:"role"` // 'kaprodi' | 'dosen' | 'staf_prodi'
	NIP       string    `json:"nip,omitempty"`
	Email     string    `json:"email,omitempty"`
	Phone     string    `json:"phone,omitempty"`
	IsActive  bool      `json:"isActive"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// LoginRequest request payload untuk POST /auth/login.
type LoginRequest struct {
	Username string `json:"username"` // username atau NIP
	Password string `json:"password"`
}

// LoginResponse respons payload untuk POST /auth/login.
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// CreateUserRequest payload untuk membuat akun baru.
type CreateUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	NIP      string `json:"nip,omitempty"`
	Email    string `json:"email,omitempty"`
	Phone    string `json:"phone,omitempty"`
}

// UpdateUserRequest payload untuk memperbarui data user.
type UpdateUserRequest struct {
	Name     string `json:"name"`
	Role     string `json:"role"`
	NIP      string `json:"nip,omitempty"`
	Email    string `json:"email,omitempty"`
	Phone    string `json:"phone,omitempty"`
	IsActive *bool  `json:"isActive,omitempty"`
}

// ChangePasswordRequest payload untuk ubah password sendiri.
type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

// ResetPasswordRequest payload untuk reset password user oleh admin/staf.
type ResetPasswordRequest struct {
	NewPassword string `json:"newPassword"`
}
