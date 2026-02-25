package handler

import (
	"net/http"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/service"
)

type AuthHandler struct {
	authService  *service.AuthService
	cookieExpire int
}

func NewAuthHandler(as *service.AuthService, cookieExpire int) *AuthHandler {
	return &AuthHandler{authService: as, cookieExpire: cookieExpire}
}

func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = decodeJSON(r, &input)

	rawToken := input.RefreshToken
	// Also try Authorization header
	if rawToken == "" {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			rawToken = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if rawToken == "" {
		apperror.HandleError(w, apperror.Unauthorized("Please provide a refresh token"))
		return
	}

	accessToken, newRefreshToken, student, err := h.authService.RefreshAccessToken(r.Context(), rawToken)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	// Set cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    accessToken,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 0, h.cookieExpire),
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	})

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data: map[string]any{
			"token":        accessToken,
			"refreshToken": newRefreshToken,
			"data":         student.ToResponse(),
		},
	})
}
