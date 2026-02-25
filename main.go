package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/kiranrana/lost-n-found-api/config"
	"github.com/kiranrana/lost-n-found-api/database"
	"github.com/kiranrana/lost-n-found-api/handler"
	"github.com/kiranrana/lost-n-found-api/repository"
	"github.com/kiranrana/lost-n-found-api/router"
	"github.com/kiranrana/lost-n-found-api/service"
)

func main() {
	if len(os.Args) > 1 && os.Args[0] != "" {
		switch os.Args[1] {
		case "seed":
			os.Args = os.Args[1:] // shift so seed.go sees --destroy as Args[1]
			runSeed()
			return
		}
	}

	cfg := config.Load("./config/config.env")

	level := slog.LevelInfo
	if cfg.Env == "development" {
		level = slog.LevelDebug
	}
	slog.SetDefault(slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: level})))

	client, db := database.Connect(cfg.DatabaseURI)
	defer database.Disconnect(client)

	if err := database.EnsureIndexes(context.Background(), db); err != nil {
		slog.Error("failed to ensure indexes", "error", err)
	}

	for _, dir := range []string{"public/profile_pictures", "public/item_photos", "public/item_videos"} {
		os.MkdirAll(dir, 0o755)
	}

	studentRepo := repository.NewStudentRepo(db)
	batchRepo := repository.NewBatchRepo(db)
	categoryRepo := repository.NewCategoryRepo(db)
	itemRepo := repository.NewItemRepo(db)
	commentRepo := repository.NewCommentRepo(db)
	refreshTokenRepo := repository.NewRefreshTokenRepo(db)

	authService := service.NewAuthService(cfg, studentRepo, refreshTokenRepo)
	studentService := service.NewStudentService(studentRepo, batchRepo, authService)
	batchService := service.NewBatchService(batchRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	itemService := service.NewItemService(itemRepo)
	commentService := service.NewCommentService(commentRepo, studentRepo, itemRepo)

	handlers := &router.Handlers{
		Student:  handler.NewStudentHandler(studentService, cfg.JWTCookieExpire),
		Auth:     handler.NewAuthHandler(authService, cfg.JWTCookieExpire),
		Batch:    handler.NewBatchHandler(batchService),
		Category: handler.NewCategoryHandler(categoryService),
		Item:     handler.NewItemHandler(itemService),
		Comment:  handler.NewCommentHandler(commentService),
		Upload:   handler.NewUploadHandler(),
	}

	r := router.New(cfg, authService, handlers)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		slog.Info("shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			slog.Error("server shutdown error", "error", err)
		}
	}()

	slog.Info("server starting", "port", cfg.Port, "env", cfg.Env)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}

	slog.Info("server stopped")
}
