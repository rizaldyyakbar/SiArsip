# SiArsip

Sistem Pengarsipan Digital Prodi RPL.

## Struktur

- `frontend/react`: React + Vite + TypeScript + Tailwind CSS
- `frontend/vue`: Vue + Vite + TypeScript + Tailwind CSS
- `backend`: Go HTTP API

## Menjalankan

```bash
npm install
npm run dev:react
npm run dev:vue
npm run dev:backend
```

Backend menyediakan `GET http://localhost:8080/health`.

## Validasi

```bash
npm run build
cd backend && go test ./...
```
