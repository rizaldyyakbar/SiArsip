package models

// CategoryStat merepresentasikan jumlah dokumen per kategori.
type CategoryStat struct {
	Category string `json:"category"`
	Count    int    `json:"count"`
}

// CriteriaStat merepresentasikan jumlah dokumen per kriteria LAM INFOKOM.
type CriteriaStat struct {
	Code  string `json:"code"`
	Title string `json:"title"`
	Count int    `json:"count"`
}

// DashboardStats merepresentasikan ringkasan analitik arsip.
type DashboardStats struct {
	TotalDocuments   int            `json:"totalDocuments"`
	TotalTrash       int            `json:"totalTrash"`
	TotalCategories  int            `json:"totalCategories"`
	TotalLecturers   int            `json:"totalLecturers"`
	ActiveYear       string         `json:"activeYear"`
	TotalStorageByte int64          `json:"totalStorageBytes"`
	ByCategory       []CategoryStat `json:"byCategory"`
	ByCriteria       []CriteriaStat `json:"byCriteria"`
}
