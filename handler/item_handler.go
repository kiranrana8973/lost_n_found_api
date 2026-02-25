package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/middleware"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/service"
	"github.com/kiranrana/lost-n-found-api/upload"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type ItemHandler struct {
	itemService *service.ItemService
}

func NewItemHandler(is *service.ItemService) *ItemHandler {
	return &ItemHandler{itemService: is}
}

func (h *ItemHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ItemName    string `json:"itemName"`
		Description string `json:"description"`
		Type        string `json:"type"`
		Category    string `json:"category"`
		Location    string `json:"location"`
		Media       string `json:"media"`
		MediaType   string `json:"mediaType"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	user := middleware.GetUser(r.Context())

	categoryID, err := parseObjectID(input.Category)
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid category ID"))
		return
	}

	item := &model.Item{
		ItemName:    input.ItemName,
		Description: input.Description,
		Type:        input.Type,
		Category:    categoryID,
		Location:    input.Location,
		Media:       input.Media,
		MediaType:   input.MediaType,
		ReportedBy:  user.ID,
	}

	created, err := h.itemService.Create(r.Context(), item)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    created,
	})
}

func (h *ItemHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	page, limit := parsePageLimit(r)
	typ := r.URL.Query().Get("type")
	status := r.URL.Query().Get("status")
	category := r.URL.Query().Get("category")

	items, total, err := h.itemService.GetAll(r.Context(), typ, status, category, page, limit)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(items),
		Total:   total,
		Page:    page,
		Pages:   totalPages(total, limit),
		Data:    items,
	})
}

func (h *ItemHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	item, err := h.itemService.GetByID(r.Context(), id)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    item,
	})
}

func (h *ItemHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	user := middleware.GetUser(r.Context())
	if user == nil {
		apperror.HandleError(w, apperror.Unauthorized("Not authorized"))
		return
	}

	var input map[string]any
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	update := bson.D{}
	stringFields := []string{"itemName", "description", "type", "location", "media", "mediaType", "status"}
	for _, field := range stringFields {
		if val, ok := input[field]; ok {
			update = append(update, bson.E{Key: field, Value: val})
		}
	}
	if val, ok := input["category"]; ok {
		if catStr, ok := val.(string); ok {
			if catID, err := parseObjectID(catStr); err == nil {
				update = append(update, bson.E{Key: "category", Value: catID})
			}
		}
	}
	if val, ok := input["claimedBy"]; ok {
		if claimStr, ok := val.(string); ok {
			if claimID, err := parseObjectID(claimStr); err == nil {
				update = append(update, bson.E{Key: "claimedBy", Value: claimID})
			}
		}
	}
	if val, ok := input["isClaimed"]; ok {
		update = append(update, bson.E{Key: "isClaimed", Value: val})
	}

	item, err := h.itemService.Update(r.Context(), id, user.ID, update)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    item,
	})
}

func (h *ItemHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	user := middleware.GetUser(r.Context())
	if user == nil {
		apperror.HandleError(w, apperror.Unauthorized("Not authorized"))
		return
	}

	item, err := h.itemService.Delete(r.Context(), id, user.ID)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	if item.Media != "" {
		_ = upload.DeleteFile(item.Media)
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Message: "Item deleted successfully",
	})
}

func (h *ItemHandler) UploadPhoto(w http.ResponseWriter, r *http.Request) {
	result, err := upload.HandleItemPhoto(r)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    result.Path,
	})
}

func (h *ItemHandler) UploadVideo(w http.ResponseWriter, r *http.Request) {
	result, err := upload.HandleItemVideo(r)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    result.Path,
	})
}
