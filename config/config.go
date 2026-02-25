package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Env                    string
	Port                   string
	DatabaseURI            string
	FileUploadPath         string
	MaxFileUpload          int64
	JWTSecret              string
	JWTExpire              time.Duration
	JWTCookieExpire        int
	RefreshTokenExpireDays int
	CORSOrigins            []string
}

func Load(path string) *Config {
	_ = godotenv.Load(path)

	jwtExpire, _ := time.ParseDuration(getEnv("JWT_EXPIRE", "15m"))
	cookieExpire, _ := strconv.Atoi(getEnv("JWT_COOKIE_EXPIRE", "1"))
	refreshDays, _ := strconv.Atoi(getEnv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
	maxUpload, _ := strconv.ParseInt(getEnv("MAX_FILE_UPLOAD", "10000000"), 10, 64)

	origins := strings.Split(getEnv("CORS_ORIGIN", "http://localhost:3000"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	return &Config{
		Env:                    getEnv("ENV", "development"),
		Port:                   getEnv("PORT", "3000"),
		DatabaseURI:            getEnv("DATABASE_URI", "mongodb://127.0.0.1:27017/lost_n_found"),
		FileUploadPath:         getEnv("FILE_UPLOAD_PATH", "./public/"),
		MaxFileUpload:          maxUpload,
		JWTSecret:              getEnv("JWT_SECRET", "secret"),
		JWTExpire:              jwtExpire,
		JWTCookieExpire:        cookieExpire,
		RefreshTokenExpireDays: refreshDays,
		CORSOrigins:            origins,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
