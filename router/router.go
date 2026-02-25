package router

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
	"github.com/kiranrana/lost-n-found-api/config"
	"github.com/kiranrana/lost-n-found-api/handler"
	"github.com/kiranrana/lost-n-found-api/middleware"
	"github.com/kiranrana/lost-n-found-api/service"
	"github.com/rs/cors"
)

type Handlers struct {
	Student  *handler.StudentHandler
	Auth     *handler.AuthHandler
	Batch    *handler.BatchHandler
	Category *handler.CategoryHandler
	Item     *handler.ItemHandler
	Comment  *handler.CommentHandler
	Upload   *handler.UploadHandler
}

func New(cfg *config.Config, authService *service.AuthService, h *Handlers) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(middleware.Recovery)
	r.Use(middleware.Logging)
	r.Use(middleware.Sanitize)
	r.Use(middleware.SecurityHeaders)

	c := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
	r.Use(c.Handler)

	r.Use(httprate.LimitByIP(100, 15*time.Minute))

	fileServer := http.FileServer(http.Dir("./public"))
	r.Handle("/public/*", http.StripPrefix("/public", fileServer))

	authLimiter := httprate.LimitByIP(5, 15*time.Minute)
	protect := middleware.Protect(authService)

	r.Route("/api/v1", func(r chi.Router) {

		r.Route("/students", func(r chi.Router) {
			r.Post("/", h.Student.Create)
			r.With(authLimiter).Post("/login", h.Student.Login)
			r.Post("/logout", h.Student.Logout)
			r.Post("/upload", h.Upload.ProfilePicture)
			r.With(protect).Get("/me", h.Student.GetMe)
			r.Get("/{id}", h.Student.GetByID)
			r.With(protect).Get("/", h.Student.GetAll)
			r.With(protect).Put("/{id}", h.Student.Update)
			r.With(protect).Delete("/{id}", h.Student.Delete)
		})

		r.With(authLimiter).Post("/auth/refresh", h.Auth.RefreshToken)

		r.Route("/batches", func(r chi.Router) {
			r.Get("/", h.Batch.GetAll)
			r.Get("/{id}", h.Batch.GetByID)
			r.With(protect).Post("/", h.Batch.Create)
			r.With(protect).Put("/{id}", h.Batch.Update)
		})

		r.Route("/categories", func(r chi.Router) {
			r.Get("/", h.Category.GetAll)
			r.Get("/{id}", h.Category.GetByID)
			r.With(protect).Post("/", h.Category.Create)
			r.With(protect).Put("/{id}", h.Category.Update)
			r.With(protect).Delete("/{id}", h.Category.Delete)
		})

		r.Route("/items", func(r chi.Router) {
			r.Get("/", h.Item.GetAll)
			r.Get("/{id}", h.Item.GetByID)
			r.With(protect).Post("/", h.Item.Create)
			r.With(protect).Put("/{id}", h.Item.Update)
			r.With(protect).Delete("/{id}", h.Item.Delete)
			r.With(protect).Post("/upload-photo", h.Item.UploadPhoto)
			r.With(protect).Post("/upload-video", h.Item.UploadVideo)
		})

		r.Route("/comments", func(r chi.Router) {
			r.Get("/item/{itemId}", h.Comment.GetByItem)
			r.Get("/{commentId}/replies", h.Comment.GetReplies)
			r.Get("/student/{studentId}", h.Comment.GetByStudent)
			r.Get("/mentions/{studentId}", h.Comment.GetMentions)
			r.With(protect).Post("/", h.Comment.Create)
			r.With(protect).Put("/{id}", h.Comment.Update)
			r.With(protect).Delete("/{id}", h.Comment.Delete)
			r.With(protect).Post("/{id}/like", h.Comment.ToggleLike)
		})
	})

	return r
}
