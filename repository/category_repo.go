package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *model.Category) (*model.Category, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Category, error)
	FindAllActive(ctx context.Context) ([]model.Category, error)
	Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Category, error)
	Delete(ctx context.Context, id bson.ObjectID) error
}

type categoryRepo struct {
	col *mongo.Collection
}

func NewCategoryRepo(db *mongo.Database) CategoryRepository {
	return &categoryRepo{col: db.Collection(model.CategoryCollection)}
}

func (r *categoryRepo) Create(ctx context.Context, category *model.Category) (*model.Category, error) {
	result, err := r.col.InsertOne(ctx, category)
	if err != nil {
		return nil, err
	}
	category.ID = result.InsertedID.(bson.ObjectID)
	return category, nil
}

func (r *categoryRepo) FindByID(ctx context.Context, id bson.ObjectID) (*model.Category, error) {
	var category model.Category
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) FindAllActive(ctx context.Context) ([]model.Category, error) {
	cursor, err := r.col.Find(ctx, bson.D{{Key: "status", Value: "active"}})
	if err != nil {
		return nil, err
	}
	var categories []model.Category
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	return categories, nil
}

func (r *categoryRepo) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Category, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var category model.Category
	err := r.col.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, bson.D{{Key: "$set", Value: update}}, opts).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *categoryRepo) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.col.DeleteOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
