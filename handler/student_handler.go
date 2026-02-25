package handler

import (
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/middleware"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/service"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type StudentHandler struct {
	studentService *service.StudentService
	cookieExpire   int
}

func NewStudentHandler(ss *service.StudentService, cookieExpire int) *StudentHandler {
	return &StudentHandler{studentService: ss, cookieExpire: cookieExpire}
}

func (h *StudentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name           string `json:"name"`
		Email          string `json:"email"`
		Username       string `json:"username"`
		Password       string `json:"password"`
		PhoneNumber    string `json:"phoneNumber"`
		BatchID        string `json:"batchId"`
		ProfilePicture string `json:"profilePicture"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	batchID, err := parseObjectID(input.BatchID)
	if err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid batch ID"))
		return
	}

	student := &model.Student{
		Name:           input.Name,
		Email:          input.Email,
		Username:       input.Username,
		Password:       input.Password,
		PhoneNumber:    input.PhoneNumber,
		BatchID:        batchID,
		ProfilePicture: input.ProfilePicture,
	}

	created, err := h.studentService.Create(r.Context(), student)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusCreated, Response{
		Success: true,
		Data:    created.ToResponse(),
	})
}

func (h *StudentHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decodeJSON(r, &input); err != nil {
		apperror.HandleError(w, apperror.BadRequest("Invalid request body"))
		return
	}

	result, err := h.studentService.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    result.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Expires:  time.Now().AddDate(0, 0, h.cookieExpire),
		SameSite: http.SameSiteNoneMode,
		Secure:   true,
	})

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data: map[string]any{
			"token":        result.AccessToken,
			"refreshToken": result.RefreshToken,
			"data":         result.Student,
		},
	})
}

func (h *StudentHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = decodeJSON(r, &input)

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})

	JSON(w, http.StatusOK, Response{
		Success: true,
		Message: "Logged out successfully",
	})
}

func (h *StudentHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	user := middleware.GetUser(r.Context())
	if user == nil {
		apperror.HandleError(w, apperror.Unauthorized("Not authorized"))
		return
	}

	student, err := h.studentService.GetByID(r.Context(), user.ID)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    student,
	})
}

func (h *StudentHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	students, err := h.studentService.GetAll(r.Context())
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Count:   len(students),
		Data:    students,
	})
}

func (h *StudentHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := parseObjectID(chi.URLParam(r, "id"))
	if err != nil {
		apperror.HandleError(w, apperror.NotFound("Resource not found"))
		return
	}

	student, err := h.studentService.GetByID(r.Context(), id)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    student,
	})
}

func (h *StudentHandler) Update(w http.ResponseWriter, r *http.Request) {
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
	allowedFields := []string{"name", "email", "username", "password", "phoneNumber", "profilePicture"}
	for _, field := range allowedFields {
		if val, ok := input[field]; ok {
			update = append(update, bson.E{Key: field, Value: val})
		}
	}
	if val, ok := input["batchId"]; ok {
		if batchIDStr, ok := val.(string); ok {
			if batchID, err := parseObjectID(batchIDStr); err == nil {
				update = append(update, bson.E{Key: "batchId", Value: batchID})
			}
		}
	}

	student, err := h.studentService.Update(r.Context(), id, user.ID, update)
	if err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Data:    student.ToResponse(),
	})
}

func (h *StudentHandler) Delete(w http.ResponseWriter, r *http.Request) {
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

	student, err := h.studentService.GetStudentByID(r.Context(), id)
	if err == nil && student.ProfilePicture != "" && student.ProfilePicture != "default-profile.png" {
		_ = removeFile("public/profile_pictures/" + student.ProfilePicture)
	}

	if err := h.studentService.Delete(r.Context(), id, user.ID); err != nil {
		apperror.HandleError(w, err)
		return
	}

	JSON(w, http.StatusOK, Response{
		Success: true,
		Message: "Student deleted successfully",
	})
}

func removeFile(path string) error {
	return os.Remove(path)
}
