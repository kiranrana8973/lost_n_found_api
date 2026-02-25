package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type StudentService struct {
	studentRepo repository.StudentRepository
	batchRepo   repository.BatchRepository
	authService *AuthService
}

func NewStudentService(sr repository.StudentRepository, br repository.BatchRepository, as *AuthService) *StudentService {
	return &StudentService{studentRepo: sr, batchRepo: br, authService: as}
}

func (s *StudentService) Create(ctx context.Context, student *model.Student) (*model.Student, error) {
	_, err := s.batchRepo.FindByID(ctx, student.BatchID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Batch not found")
		}
		return nil, err
	}

	existing, err := s.studentRepo.FindByEmail(ctx, strings.ToLower(student.Email))
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}
	if existing != nil {
		return nil, apperror.DuplicateKey("email")
	}

	existing, err = s.studentRepo.FindByUsernameCaseInsensitive(ctx, student.Username)
	if err != nil && !errors.Is(err, mongo.ErrNoDocuments) {
		return nil, err
	}
	if existing != nil {
		return nil, apperror.DuplicateKey("username")
	}

	hashed, err := s.authService.HashPassword(student.Password)
	if err != nil {
		return nil, err
	}
	student.Password = hashed
	student.Email = strings.ToLower(strings.TrimSpace(student.Email))
	student.Username = strings.TrimSpace(student.Username)
	student.Name = strings.TrimSpace(student.Name)
	student.PhoneNumber = strings.TrimSpace(student.PhoneNumber)
	if student.ProfilePicture == "" {
		student.ProfilePicture = "default-profile.png"
	}
	student.CreatedAt = time.Now()

	created, err := s.studentRepo.Create(ctx, student)
	if err != nil {
		return nil, err
	}

	created.Password = ""
	return created, nil
}

type LoginResult struct {
	AccessToken  string
	RefreshToken string
	Student      model.StudentResponse
}

func (s *StudentService) Login(ctx context.Context, email, password string) (*LoginResult, error) {
	if email == "" || password == "" {
		return nil, apperror.BadRequest("Please provide email and password")
	}

	student, err := s.studentRepo.FindByEmail(ctx, strings.ToLower(email))
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.Unauthorized("Invalid credentials")
		}
		return nil, err
	}

	if !s.authService.ComparePassword(student.Password, password) {
		return nil, apperror.Unauthorized("Invalid credentials")
	}

	accessToken, err := s.authService.GenerateAccessToken(student.ID)
	if err != nil {
		return nil, err
	}

	rawRefresh, hashedRefresh, err := s.authService.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	if err := s.authService.StoreRefreshToken(ctx, hashedRefresh, student.ID); err != nil {
		return nil, err
	}

	return &LoginResult{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
		Student:      student.ToResponse(),
	}, nil
}

func (s *StudentService) GetAll(ctx context.Context) ([]bson.Raw, error) {
	return s.studentRepo.FindAllPopulated(ctx)
}

func (s *StudentService) GetByID(ctx context.Context, id bson.ObjectID) (bson.Raw, error) {
	return s.studentRepo.FindByIDPopulated(ctx, id)
}

func (s *StudentService) Update(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID, update bson.D) (*model.Student, error) {
	if id != requestorID {
		return nil, apperror.Forbidden("You can only update your own profile")
	}

	for i, elem := range update {
		if elem.Key == "password" {
			hashed, err := s.authService.HashPassword(elem.Value.(string))
			if err != nil {
				return nil, err
			}
			update[i].Value = hashed
		}
	}

	return s.studentRepo.Update(ctx, id, update)
}

func (s *StudentService) Delete(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID) error {
	if id != requestorID {
		return apperror.Forbidden("You can only delete your own profile")
	}
	return s.studentRepo.Delete(ctx, id)
}

func (s *StudentService) GetStudentByID(ctx context.Context, id bson.ObjectID) (*model.Student, error) {
	return s.studentRepo.FindByID(ctx, id)
}
