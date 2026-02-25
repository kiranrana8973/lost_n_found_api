package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type ItemRepository interface {
	Create(ctx context.Context, item *model.Item) (*model.Item, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Item, error)
	FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error)
	FindAllPopulated(ctx context.Context, filter bson.D, page, limit int) ([]bson.Raw, int64, error)
	Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Item, error)
	Delete(ctx context.Context, id bson.ObjectID) error
}

type itemRepo struct {
	col *mongo.Collection
}

func NewItemRepo(db *mongo.Database) ItemRepository {
	return &itemRepo{col: db.Collection(model.ItemCollection)}
}

func (r *itemRepo) Create(ctx context.Context, item *model.Item) (*model.Item, error) {
	result, err := r.col.InsertOne(ctx, item)
	if err != nil {
		return nil, err
	}
	item.ID = result.InsertedID.(bson.ObjectID)
	return item, nil
}

func (r *itemRepo) FindByID(ctx context.Context, id bson.ObjectID) (*model.Item, error) {
	var item model.Item
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func populateItemPipeline() mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "students"},
			{Key: "localField", Value: "reportedBy"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "reportedByData"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{
					{Key: "name", Value: 1},
					{Key: "username", Value: 1},
				}}},
			}},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$reportedByData"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "students"},
			{Key: "localField", Value: "claimedBy"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "claimedByData"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$claimedByData"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "categories"},
			{Key: "localField", Value: "category"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "categoryData"},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$categoryData"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
	}
}

func (r *itemRepo) FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: id}}}},
	}
	pipeline = append(pipeline, populateItemPipeline()...)

	cursor, err := r.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	if cursor.Next(ctx) {
		return cursor.Current, nil
	}
	return nil, mongo.ErrNoDocuments
}

func (r *itemRepo) FindAllPopulated(ctx context.Context, filter bson.D, page, limit int) ([]bson.Raw, int64, error) {
	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := (page - 1) * limit

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: filter}},
		{{Key: "$sort", Value: bson.D{{Key: "createdAt", Value: -1}}}},
		{{Key: "$skip", Value: int64(skip)}},
		{{Key: "$limit", Value: int64(limit)}},
	}
	pipeline = append(pipeline, populateItemPipeline()...)

	cursor, err := r.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, 0, err
	}
	var results []bson.Raw
	if err := cursor.All(ctx, &results); err != nil {
		return nil, 0, err
	}
	return results, total, nil
}

func (r *itemRepo) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Item, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var item model.Item
	err := r.col.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, bson.D{{Key: "$set", Value: update}}, opts).Decode(&item)
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *itemRepo) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.col.DeleteOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
