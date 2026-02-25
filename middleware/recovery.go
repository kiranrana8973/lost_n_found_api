package middleware

import (
	"log/slog"
	"net/http"
	"runtime/debug"

	"github.com/kiranrana/lost-n-found-api/apperror"
)

func Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				slog.Error("panic recovered",
					"error", err,
					"stack", string(debug.Stack()),
				)
				apperror.HandleError(w, apperror.BadRequest("Internal server error"))
			}
		}()
		next.ServeHTTP(w, r)
	})
}
