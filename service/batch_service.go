package service

import (
	"context"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type BatchService struct {
	batchRepo repository.BatchRepository
}

func NewBatchService(br repository.BatchRepository) *BatchService {
	return &BatchService{batchRepo: br}
}

func (s *BatchService) Create(ctx context.Context, batch *model.Batch) (*model.Batch, error) {
	batch.BatchName = strings.TrimSpace(batch.BatchName)
	if batch.Status == "" {
		batch.Status = "active"
	}
	batch.CreatedAt = time.Now()
	return s.batchRepo.Create(ctx, batch)
}

func (s *BatchService) GetAll(ctx context.Context) ([]model.Batch, error) {
	return s.batchRepo.FindAll(ctx)
}

func (s *BatchService) GetByID(ctx context.Context, id bson.ObjectID) (*model.Batch, error) {
	return s.batchRepo.FindByID(ctx, id)
}

func (s *BatchService) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Batch, error) {
	return s.batchRepo.Update(ctx, id, update)
}
