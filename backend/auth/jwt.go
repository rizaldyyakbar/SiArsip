package auth

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/arsip-prodi/siarsip/backend/models"
	"github.com/golang-jwt/jwt/v5"
)

var defaultSecret = []byte("siarsip-secret-key-rekayasa-perangkat-lunak-2026")

func getSecret() []byte {
	s := os.Getenv("JWT_SECRET")
	if s != "" {
		return []byte(s)
	}
	return defaultSecret
}

type Claims struct {
	UserID   int64  `json:"uid"`
	Username string `json:"usr"`
	Name     string `json:"nam"`
	Role     string `json:"rol"`
	NIP      string `json:"nip,omitempty"`
	Email    string `json:"eml,omitempty"`
	jwt.RegisteredClaims
}

// GenerateToken membuat token JWT baru dengan masa berlaku 7 hari.
func GenerateToken(u models.User) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour)
	claims := &Claims{
		UserID:   u.ID,
		Username: u.Username,
		Name:     u.Name,
		Role:     u.Role,
		NIP:      u.NIP,
		Email:    u.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "siarsip-api",
			Subject:   u.Username,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecret())
}

// ValidateToken memvalidasi string JWT dan mengembalikan Claims jika sah.
func ValidateToken(tokenStr string) (*Claims, error) {
	if tokenStr == "" {
		return nil, errors.New("token kosong")
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("metode signing tidak valid")
		}
		return getSecret(), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token tidak valid atau telah kedaluwarsa")
	}

	return claims, nil
}

// ExtractBearerToken mengambil token dari header Authorization format "Bearer <token>".
func ExtractBearerToken(authHeader string) string {
	parts := strings.Split(strings.TrimSpace(authHeader), " ")
	if len(parts) == 2 && strings.EqualFold(parts[0], "bearer") {
		return parts[1]
	}
	return ""
}
