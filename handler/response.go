package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"strconv"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Response struct {
	Success bool   `json:"success"`
	Data    any    `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
	Count   int    `json:"count,omitempty"`
	Total   int64  `json:"total,omitempty"`
	Page    int    `json:"page,omitempty"`
	Pages   int    `json:"pages,omitempty"`
}

func JSON(w http.ResponseWriter, status int, resp Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(resp)
}

func parseObjectID(s string) (bson.ObjectID, error) {
	return bson.ObjectIDFromHex(s)
}

func parsePageLimit(r *http.Request) (int, int) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	return page, limit
}

func totalPages(total int64, limit int) int {
	return int(math.Ceil(float64(total) / float64(limit)))
}

func decodeJSON(r *http.Request, v any) error {
	return json.NewDecoder(r.Body).Decode(v)
}
