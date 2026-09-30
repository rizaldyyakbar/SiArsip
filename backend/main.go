package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(writer http.ResponseWriter, request *http.Request) {
		writer.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(writer).Encode(map[string]string{"status": "ok", "service": "siarsip-api"})
	})

	log.Println("SiArsip API berjalan di http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
