package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/arsip-prodi/siarsip/backend/db"
	"github.com/arsip-prodi/siarsip/backend/handlers"
	"github.com/arsip-prodi/siarsip/backend/storage"
)

func main() {
	ctx := context.Background()

	// ── Koneksi ke PostgreSQL ──────────────────────────────────────────────
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://localhost:5432/siarsip?sslmode=disable"
	}
	connection, err := db.Connect(ctx, databaseURL)
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}
	defer connection.Close()
	log.Println("Berhasil terhubung ke PostgreSQL")

	// ── Jalankan migrasi DDL ───────────────────────────────────────────────
	if err := db.Migrate(ctx, connection); err != nil {
		log.Fatal("Gagal menjalankan migrasi database:", err)
	}
	log.Println("Migrasi database selesai")

	// ── Router ────────────────────────────────────────────────────────────
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Daftarkan semua handler
	handlers.NewDocumentHandler(connection, storage.NewLocal("uploads")).RegisterRoutes(mux)
	handlers.NewAcademicYearHandler(connection).RegisterRoutes(mux)
	handlers.NewCriteriaHandler(connection).RegisterRoutes(mux)
	handlers.NewAuditHandler(connection).RegisterRoutes(mux)

	// ── CORS middleware (untuk dev frontend) ──────────────────────────────
	withCORS := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		mux.ServeHTTP(w, r)
	})

	log.Println("SiArsip API berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", withCORS))
}
