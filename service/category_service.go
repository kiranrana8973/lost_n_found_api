package service

import (
	"context"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type CategoryService struct {
	categoryRepo repository.CategoryRepository
}

func NewCategoryService(cr repository.CategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: cr}
}

func (s *CategoryService) Create(ctx context.Context, category *model.Category) (*model.Category, error) {
	category.Name = strings.TrimSpace(category.Name)
	category.Description = strings.TrimSpace(category.Description)
	if category.Status == "" {
		category.Status = "active"
	}
	category.CreatedAt = time.Now()
	return s.categoryRepo.Create(ctx, category)
}

func (s *CategoryService) GetAllActive(ctx context.Context) ([]model.Category, error) {
	return s.categoryRepo.FindAllActive(ctx)
}

func (s *CategoryService) GetByID(ctx context.Context, id bson.ObjectID) (*model.Category, error) {
	return s.categoryRepo.FindByID(ctx, id)
}

func (s *CategoryService) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Category, error) {
	return s.categoryRepo.Update(ctx, id, update)
}

func (s *CategoryService) Delete(ctx context.Context, id bson.ObjectID) error {
	return s.categoryRepo.Delete(ctx, id)
}
