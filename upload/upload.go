package upload

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/apperror"
)

var (
	imageExts = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true}
	videoExts = map[string]bool{".mp4": true, ".avi": true, ".mov": true, ".wmv": true}
)

const (
	MaxImageSize = 2 << 20  // 2MB
	MaxVideoSize = 50 << 20 // 50MB
)

type UploadResult struct {
	Filename string
	Path     string
}

func HandleProfilePicture(r *http.Request) (*UploadResult, error) {
	return handleUpload(r, "profilePicture", "public/profile_pictures", "pro-pic", imageExts, MaxImageSize)
}

func HandleItemPhoto(r *http.Request) (*UploadResult, error) {
	return handleUpload(r, "itemPhoto", "public/item_photos", "itm-pic", imageExts, MaxImageSize)
}

func HandleItemVideo(r *http.Request) (*UploadResult, error) {
	return handleUpload(r, "itemVideo", "public/item_videos", "item-vid", videoExts, MaxVideoSize)
}

func handleUpload(r *http.Request, fieldName, destDir, prefix string, allowedExts map[string]bool, maxSize int64) (*UploadResult, error) {
	if err := r.ParseMultipartForm(maxSize); err != nil {
		return nil, apperror.BadRequest(fmt.Sprintf("File too large. Maximum size is %d bytes", maxSize))
	}

	file, header, err := r.FormFile(fieldName)
	if err != nil {
		return nil, apperror.BadRequest("Please upload a file with field name: " + fieldName)
	}
	defer file.Close()

	if header.Size > maxSize {
		return nil, apperror.BadRequest(fmt.Sprintf("File too large. Maximum size is %d bytes", maxSize))
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExts[ext] {
		allowed := make([]string, 0, len(allowedExts))
		for k := range allowedExts {
			allowed = append(allowed, k)
		}
		return nil, apperror.BadRequest("Invalid file type. Allowed: " + strings.Join(allowed, ", "))
	}

	if err := os.MkdirAll(destDir, 0o755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	filename := fmt.Sprintf("%s-%d%s", prefix, time.Now().UnixMilli(), ext)
	destPath := filepath.Join(destDir, filename)

	dst, err := os.Create(destPath)
	if err != nil {
		return nil, fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	relPath := strings.TrimPrefix(destDir, "public/") + "/" + filename

	return &UploadResult{
		Filename: filename,
		Path:     relPath,
	}, nil
}

func DeleteFile(filePath string) error {
	fullPath := filepath.Join("public", filePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil // File doesn't exist, nothing to delete
	}
	return os.Remove(fullPath)
}
