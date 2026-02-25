package handler

import (
	"net/http"

	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/upload"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

func (h *UploadHandler) ProfilePicture(w http.ResponseWriter, r *http.Request) {
	result, err := upload.HandleProfilePicture(r)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    result.Filename,
	})
}
