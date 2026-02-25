package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/config"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	cfg             *config.Config
	studentRepo     repository.StudentRepository
	refreshTokenRepo repository.RefreshTokenRepository
}

func NewAuthService(cfg *config.Config, sr repository.StudentRepository, rtr repository.RefreshTokenRepository) *AuthService {
	return &AuthService{cfg: cfg, studentRepo: sr, refreshTokenRepo: rtr}
}

func (s *AuthService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (s *AuthService) ComparePassword(hashed, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain)) == nil
}

func (s *AuthService) GenerateAccessToken(studentID bson.ObjectID) (string, error) {
	claims := jwt.MapClaims{
		"id":  studentID.Hex(),
		"exp": time.Now().Add(s.cfg.JWTExpire).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}

func (s *AuthService) VerifyAccessToken(tokenStr string) (bson.ObjectID, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, apperror.Unauthorized("Invalid token")
		}
		return []byte(s.cfg.JWTSecret), nil
	})
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return bson.ObjectID{}, apperror.Unauthorized("Token expired")
		}
		return bson.ObjectID{}, apperror.Unauthorized("Invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return bson.ObjectID{}, apperror.Unauthorized("Invalid token")
	}

	idStr, ok := claims["id"].(string)
	if !ok {
		return bson.ObjectID{}, apperror.Unauthorized("Invalid token")
	}

	id, err := bson.ObjectIDFromHex(idStr)
	if err != nil {
		return bson.ObjectID{}, apperror.Unauthorized("Invalid token")
	}

	return id, nil
}

func (s *AuthService) GenerateRefreshToken() (raw string, hashed string, err error) {
	b := make([]byte, 40)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	raw = hex.EncodeToString(b)
	hash := sha256.Sum256([]byte(raw))
	hashed = hex.EncodeToString(hash[:])
	return raw, hashed, nil
}

func (s *AuthService) HashToken(raw string) string {
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func (s *AuthService) StoreRefreshToken(ctx context.Context, hashedToken string, studentID bson.ObjectID) error {
	rt := &model.RefreshToken{
		Token:     hashedToken,
		Student:   studentID,
		ExpiresAt: time.Now().AddDate(0, 0, s.cfg.RefreshTokenExpireDays),
		CreatedAt: time.Now(),
	}
	return s.refreshTokenRepo.Create(ctx, rt)
}

func (s *AuthService) RefreshAccessToken(ctx context.Context, rawRefreshToken string) (accessToken, newRefreshToken string, student *model.Student, err error) {
	hashedToken := s.HashToken(rawRefreshToken)

	rt, err := s.refreshTokenRepo.FindByToken(ctx, hashedToken)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return "", "", nil, apperror.Unauthorized("Invalid refresh token")
		}
		return "", "", nil, err
	}

	if time.Now().After(rt.ExpiresAt) {
		_ = s.refreshTokenRepo.DeleteByToken(ctx, hashedToken)
		return "", "", nil, apperror.Unauthorized("Refresh token expired")
	}

	// Delete old token (rotation)
	_ = s.refreshTokenRepo.DeleteByToken(ctx, hashedToken)

	// Get student
	student, err = s.studentRepo.FindByID(ctx, rt.Student)
	if err != nil {
		return "", "", nil, apperror.Unauthorized("User not found")
	}

	// Generate new tokens
	accessToken, err = s.GenerateAccessToken(student.ID)
	if err != nil {
		return "", "", nil, err
	}

	rawNew, hashedNew, err := s.GenerateRefreshToken()
	if err != nil {
		return "", "", nil, err
	}

	if err := s.StoreRefreshToken(ctx, hashedNew, student.ID); err != nil {
		return "", "", nil, err
	}

	return accessToken, rawNew, student, nil
}

func (s *AuthService) GetStudentByID(ctx context.Context, id bson.ObjectID) (*model.Student, error) {
	return s.studentRepo.FindByID(ctx, id)
}

func (s *AuthService) DeleteRefreshToken(ctx context.Context, rawToken string) error {
	hashedToken := s.HashToken(rawToken)
	return s.refreshTokenRepo.DeleteByToken(ctx, hashedToken)
}
