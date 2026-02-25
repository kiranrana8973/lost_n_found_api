package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/service"
)

type contextKey string

const UserContextKey contextKey = "user"

func GetUser(ctx context.Context) *model.Student {
	user, _ := ctx.Value(UserContextKey).(*model.Student)
	return user
}

func Protect(authService *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				apperror.HandleError(w, apperror.Unauthorized("Not authorized to access this route"))
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

			studentID, err := authService.VerifyAccessToken(tokenStr)
			if err != nil {
				apperror.HandleError(w, err)
				return
			}

			student, err := authService.GetStudentByID(r.Context(), studentID)
			if err != nil {
				apperror.HandleError(w, apperror.Unauthorized("User not found"))
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, student)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func Authorize(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := GetUser(r.Context())
			if user == nil {
				apperror.HandleError(w, apperror.Unauthorized("Not authorized"))
				return
			}

			for _, role := range roles {
				if user.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			apperror.HandleError(w, apperror.Forbidden("User role is not authorized to access this route"))
		})
	}
}
