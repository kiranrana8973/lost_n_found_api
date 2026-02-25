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

type ItemService struct {
	itemRepo repository.ItemRepository
}

func NewItemService(ir repository.ItemRepository) *ItemService {
	return &ItemService{itemRepo: ir}
}

func (s *ItemService) Create(ctx context.Context, item *model.Item) (*model.Item, error) {
	item.ItemName = strings.TrimSpace(item.ItemName)
	item.Description = strings.TrimSpace(item.Description)
	item.Location = strings.TrimSpace(item.Location)
	if item.MediaType == "" {
		item.MediaType = "photo"
	}
	if item.Status == "" {
		item.Status = "available"
	}
	now := time.Now()
	item.CreatedAt = now
	item.UpdatedAt = now
	return s.itemRepo.Create(ctx, item)
}

func (s *ItemService) GetAll(ctx context.Context, typ, status, category string, page, limit int) ([]bson.Raw, int64, error) {
	filter := bson.D{}
	if typ != "" {
		filter = append(filter, bson.E{Key: "type", Value: typ})
	}
	if status != "" {
		filter = append(filter, bson.E{Key: "status", Value: status})
	}
	if category != "" {
		catID, err := bson.ObjectIDFromHex(category)
		if err == nil {
			filter = append(filter, bson.E{Key: "category", Value: catID})
		}
	}
	return s.itemRepo.FindAllPopulated(ctx, filter, page, limit)
}

func (s *ItemService) GetByID(ctx context.Context, id bson.ObjectID) (bson.Raw, error) {
	return s.itemRepo.FindByIDPopulated(ctx, id)
}

func (s *ItemService) Update(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID, update bson.D) (*model.Item, error) {
	item, err := s.itemRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Item not found")
		}
		return nil, err
	}

	if item.ReportedBy != requestorID {
		return nil, apperror.Forbidden("You can only update items you reported")
	}

	update = append(update, bson.E{Key: "updatedAt", Value: time.Now()})
	return s.itemRepo.Update(ctx, id, update)
}

func (s *ItemService) Delete(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID) (*model.Item, error) {
	item, err := s.itemRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Item not found")
		}
		return nil, err
	}

	if item.ReportedBy != requestorID {
		return nil, apperror.Forbidden("You can only delete items you reported")
	}

	if err := s.itemRepo.Delete(ctx, id); err != nil {
		return nil, err
	}
	return item, nil
}
