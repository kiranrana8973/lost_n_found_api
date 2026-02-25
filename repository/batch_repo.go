package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type BatchRepository interface {
	Create(ctx context.Context, batch *model.Batch) (*model.Batch, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Batch, error)
	FindAll(ctx context.Context) ([]model.Batch, error)
	Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Batch, error)
}

type batchRepo struct {
	col *mongo.Collection
}

func NewBatchRepo(db *mongo.Database) BatchRepository {
	return &batchRepo{col: db.Collection(model.BatchCollection)}
}

func (r *batchRepo) Create(ctx context.Context, batch *model.Batch) (*model.Batch, error) {
	result, err := r.col.InsertOne(ctx, batch)
	if err != nil {
		return nil, err
	}
	batch.ID = result.InsertedID.(bson.ObjectID)
	return batch, nil
}

func (r *batchRepo) FindByID(ctx context.Context, id bson.ObjectID) (*model.Batch, error) {
	var batch model.Batch
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&batch)
	if err != nil {
		return nil, err
	}
	return &batch, nil
}

func (r *batchRepo) FindAll(ctx context.Context) ([]model.Batch, error) {
	cursor, err := r.col.Find(ctx, bson.D{})
	if err != nil {
		return nil, err
	}
	var batches []model.Batch
	if err := cursor.All(ctx, &batches); err != nil {
		return nil, err
	}
	return batches, nil
}

func (r *batchRepo) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Batch, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var batch model.Batch
	err := r.col.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, bson.D{{Key: "$set", Value: update}}, opts).Decode(&batch)
	if err != nil {
		return nil, err
	}
	return &batch, nil
}
