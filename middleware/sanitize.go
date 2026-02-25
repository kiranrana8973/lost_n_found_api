package middleware

import (
	"bytes"
	"io"
	"net/http"
	"strings"
)

var skipFields = map[string]bool{
	"email":          true,
	"username":       true,
	"password":       true,
	"mediaUrl":       true,
	"profilePicture": true,
}

func Sanitize(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Body != nil && r.ContentLength > 0 {
			body, err := io.ReadAll(r.Body)
			r.Body.Close()
			if err == nil {
				sanitized := sanitizeBody(string(body))
				r.Body = io.NopCloser(bytes.NewBufferString(sanitized))
				r.ContentLength = int64(len(sanitized))
			}
		}
		next.ServeHTTP(w, r)
	})
}

func sanitizeBody(body string) string {
	result := body
	result = strings.ReplaceAll(result, "<", "&lt;")
	result = strings.ReplaceAll(result, ">", "&gt;")
	result = removeDollarSigns(result)
	return result
}

func removeDollarSigns(s string) string {
	var result strings.Builder
	inString := false
	escaped := false

	for i := 0; i < len(s); i++ {
		ch := s[i]
		if escaped {
			result.WriteByte(ch)
			escaped = false
			continue
		}
		if ch == '\\' && inString {
			result.WriteByte(ch)
			escaped = true
			continue
		}
		if ch == '"' {
			inString = !inString
			result.WriteByte(ch)
			continue
		}
		if ch == '$' && inString {
			continue
		}
		result.WriteByte(ch)
	}
	return result.String()
}
