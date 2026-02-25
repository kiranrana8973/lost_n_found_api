package apperror

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

type AppError struct {
	Code    int    `json:"-"`
	Message string `json:"message"`
}

func (e *AppError) Error() string { return e.Message }

func NotFound(msg string) *AppError     { return &AppError{Code: http.StatusNotFound, Message: msg} }
func BadRequest(msg string) *AppError   { return &AppError{Code: http.StatusBadRequest, Message: msg} }
func Unauthorized(msg string) *AppError { return &AppError{Code: http.StatusUnauthorized, Message: msg} }
func Forbidden(msg string) *AppError    { return &AppError{Code: http.StatusForbidden, Message: msg} }

func DuplicateKey(field string) *AppError {
	return &AppError{Code: http.StatusBadRequest, Message: field + " already exists"}
}

func HandleError(w http.ResponseWriter, err error) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		writeJSON(w, appErr.Code, map[string]any{
			"success": false,
			"message": appErr.Message,
		})
		return
	}

	// MongoDB duplicate key error
	if mongo.IsDuplicateKeyError(err) {
		field := extractDuplicateField(err.Error())
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"success": false,
			"message": field + " already exists",
		})
		return
	}

	// MongoDB no documents
	if errors.Is(err, mongo.ErrNoDocuments) {
		writeJSON(w, http.StatusNotFound, map[string]any{
			"success": false,
			"message": "Resource not found",
		})
		return
	}

	// Default internal server error
	slog.Error("unhandled error", "error", err)
	writeJSON(w, http.StatusInternalServerError, map[string]any{
		"success": false,
		"message": "Internal server error",
	})
}

func extractDuplicateField(msg string) string {
	// MongoDB duplicate key error contains the index name like "email_1"
	if idx := strings.Index(msg, "index:"); idx != -1 {
		part := msg[idx+7:]
		if end := strings.Index(part, "_1"); end != -1 {
			field := strings.TrimSpace(part[:end])
			// Get just the last part after any space
			parts := strings.Fields(field)
			if len(parts) > 0 {
				return parts[len(parts)-1]
			}
		}
	}
	return "Field"
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
