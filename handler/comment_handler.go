package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/middleware"
	"github.com/kiranrana/lost-n-found-api/service"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(cs *service.CommentService) *CommentHandler {
	return &CommentHandler{commentService: cs}
}

func (h *CommentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Text            string `json:"text"`
		ItemID          string `json:"itemId"`
		CommentedBy     string `json:"commentedBy"`
		ParentCommentID string `json:"parentCommentId"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	itemID, err := parseObjectID(input.ItemID)
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid item ID"))
		return
	}

	commentedBy, err := parseObjectID(input.CommentedBy)
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid student ID"))
		return
	}

	var parentID *bson.ObjectID
	if input.ParentCommentID != "" {
		pid, err := parseObjectID(input.ParentCommentID)
		if err != nil {
			apperror.HandleError(w, apperror.BadRequest("Invalid parent comment ID"))
			return
		}
		parentID = &pid
	}

	comment, err := h.commentService.Create(r.Context(), input.Text, itemID, commentedBy, parentID)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    comment,
	})
}

func (h *CommentHandler) GetByItem(w http.ResponseWriter, r *http.Request) {
	itemID, err := parseObjectID(chi.URLParam(r, "itemId"))
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid item ID"))
		return
	}

	page, limit := parsePageLimit(r)
	includeReplies := r.URL.Query().Get("includeReplies") == "true"

	comments, total, err := h.commentService.GetByItem(r.Context(), itemID, includeReplies, page, limit)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(comments),
		Total:   total,
		Page:    page,
		Pages:   totalPages(total, limit),
		Data:    comments,
	})
}

func (h *CommentHandler) GetReplies(w http.ResponseWriter, r *http.Request) {
	commentID, err := parseObjectID(chi.URLParam(r, "commentId"))
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid comment ID"))
		return
	}

	page, limit := parsePageLimit(r)

	replies, total, err := h.commentService.GetReplies(r.Context(), commentID, page, limit)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(replies),
		Total:   total,
		Page:    page,
		Pages:   totalPages(total, limit),
		Data:    replies,
	})
}

func (h *CommentHandler) GetByStudent(w http.ResponseWriter, r *http.Request) {
	studentID, err := parseObjectID(chi.URLParam(r, "studentId"))
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid student ID"))
		return
	}

	page, limit := parsePageLimit(r)

	comments, total, err := h.commentService.GetByStudent(r.Context(), studentID, page, limit)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(comments),
		Total:   total,
		Page:    page,
		Pages:   totalPages(total, limit),
		Data:    comments,
	})
}

func (h *CommentHandler) GetMentions(w http.ResponseWriter, r *http.Request) {
	studentID, err := parseObjectID(chi.URLParam(r, "studentId"))
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid student ID"))
		return
	}

	page, limit := parsePageLimit(r)

	comments, total, err := h.commentService.GetMentions(r.Context(), studentID, page, limit)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(comments),
		Total:   total,
		Page:    page,
		Pages:   totalPages(total, limit),
		Data:    comments,
	})
}

func (h *CommentHandler) Update(w http.ResponseWriter, r *http.Request) {
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

	var input struct {
		Text string `json:"text"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	comment, err := h.commentService.Update(r.Context(), id, user.ID, input.Text)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    comment,
	})
}

func (h *CommentHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

	if err := h.commentService.Delete(r.Context(), id, user.ID); err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Message: "Comment deleted successfully",
	})
}

func (h *CommentHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	var input struct {
		StudentID string `json:"studentId"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	studentID, err := parseObjectID(input.StudentID)
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid student ID"))
		return
	}

	result, err := h.commentService.ToggleLike(r.Context(), id, studentID)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data: map[string]any{
			"liked":     result.Liked,
			"likeCount": result.LikeCount,
			"comment":   result.Comment,
		},
	})
}
