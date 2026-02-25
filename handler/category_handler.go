package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/service"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler(cs *service.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: cs}
}

func (h *CategoryHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	category := &model.Category{
		Name:        input.Name,
		Description: input.Description,
		Status:      input.Status,
	}

	created, err := h.categoryService.Create(r.Context(), category)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    created,
	})
}

func (h *CategoryHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	categories, err := h.categoryService.GetAllActive(r.Context())
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(categories),
		Data:    categories,
	})
}

func (h *CategoryHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	category, err := h.categoryService.GetByID(r.Context(), id)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    category,
	})
}

func (h *CategoryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	var input map[string]any
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	update := bson.D{}
	for _, field := range []string{"name", "description", "status"} {
		if val, ok := input[field]; ok {
			update = append(update, bson.E{Key: field, Value: val})
		}
	}

	category, err := h.categoryService.Update(r.Context(), id, update)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    category,
	})
}

func (h *CategoryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	if err := h.categoryService.Delete(r.Context(), id); err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Message: "Category deleted successfully",
	})
}
