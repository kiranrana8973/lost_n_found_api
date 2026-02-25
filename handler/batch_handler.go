package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/service"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type BatchHandler struct {
	batchService *service.BatchService
}

func NewBatchHandler(bs *service.BatchService) *BatchHandler {
	return &BatchHandler{batchService: bs}
}

func (h *BatchHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		BatchName string `json:"batchName"`
		Status    string `json:"status"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	batch := &model.Batch{
		BatchName: input.BatchName,
		Status:    input.Status,
	}

	created, err := h.batchService.Create(r.Context(), batch)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    created,
	})
}

func (h *BatchHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	batches, err := h.batchService.GetAll(r.Context())
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(batches),
		Data:    batches,
	})
}

func (h *BatchHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	batch, err := h.batchService.GetByID(r.Context(), id)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    batch,
	})
}

func (h *BatchHandler) Update(w http.ResponseWriter, r *http.Request) {
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
	if val, ok := input["batchName"]; ok {
		update = append(update, bson.E{Key: "batchName", Value: val})
	}
	if val, ok := input["status"]; ok {
		update = append(update, bson.E{Key: "status", Value: val})
	}

	batch, err := h.batchService.Update(r.Context(), id, update)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    batch,
	})
}
