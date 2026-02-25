package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type CommentRepository interface {
	Create(ctx context.Context, comment *model.Comment) (*model.Comment, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Comment, error)
	FindByItemPopulated(ctx context.Context, itemID bson.ObjectID, includeReplies bool, page, limit int) ([]bson.Raw, int64, error)
	FindRepliesPopulated(ctx context.Context, parentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error)
	FindByStudentPopulated(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error)
	FindMentionsPopulated(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error)
	CountReplies(ctx context.Context, parentID bson.ObjectID) (int64, error)
	Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Comment, error)
	Delete(ctx context.Context, id bson.ObjectID) error
	DeleteReplies(ctx context.Context, parentID bson.ObjectID) error
	AddLike(ctx context.Context, id bson.ObjectID, studentID bson.ObjectID) error
	RemoveLike(ctx context.Context, id bson.ObjectID, studentID bson.ObjectID) error
	FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error)
}

type commentRepo struct {
	col *mongo.Collection
}

func NewCommentRepo(db *mongo.Database) CommentRepository {
	return &commentRepo{col: db.Collection(model.CommentCollection)}
}

func commentPopulatePipeline() mongo.Pipeline {
	return mongo.Pipeline{
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "students"},
			{Key: "localField", Value: "commentedBy"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "commentedByData"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{
					{Key: "name", Value: 1},
					{Key: "username", Value: 1},
					{Key: "profilePicture", Value: 1},
				}}},
			}},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$commentedByData"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "students"},
			{Key: "localField", Value: "mentionedUsers"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "mentionedUsersData"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{
					{Key: "name", Value: 1},
					{Key: "username", Value: 1},
				}}},
			}},
		}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "students"},
			{Key: "localField", Value: "likes"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "likesData"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{
					{Key: "name", Value: 1},
					{Key: "username", Value: 1},
				}}},
			}},
		}}},
	}
}

func (r *commentRepo) Create(ctx context.Context, comment *model.Comment) (*model.Comment, error) {
	result, err := r.col.InsertOne(ctx, comment)
	if err != nil {
		return nil, err
	}
	comment.ID = result.InsertedID.(bson.ObjectID)
	return comment, nil
}

func (r *commentRepo) FindByID(ctx context.Context, id bson.ObjectID) (*model.Comment, error) {
	var comment model.Comment
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *commentRepo) FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: id}}}},
	}
	pipeline = append(pipeline, commentPopulatePipeline()...)

	cursor, err := r.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	if cursor.Next(ctx) {
		return cursor.Current, nil
	}
	return nil, mongo.ErrNoDocuments
}

func (r *commentRepo) FindByItemPopulated(ctx context.Context, itemID bson.ObjectID, includeReplies bool, page, limit int) ([]bson.Raw, int64, error) {
	filter := bson.D{{Key: "item", Value: itemID}}
	if !includeReplies {
		filter = append(filter, bson.E{Key: "isReply", Value: false})
	}

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
	pipeline = append(pipeline, commentPopulatePipeline()...)

	if !includeReplies {
		pipeline = append(pipeline, bson.D{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "comments"},
			{Key: "localField", Value: "_id"},
			{Key: "foreignField", Value: "parentComment"},
			{Key: "as", Value: "replies"},
		}}})
		pipeline = append(pipeline, bson.D{{Key: "$addFields", Value: bson.D{
			{Key: "replyCount", Value: bson.D{{Key: "$size", Value: "$replies"}}},
		}}})
		pipeline = append(pipeline, bson.D{{Key: "$project", Value: bson.D{
			{Key: "replies", Value: 0},
		}}})
	}

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

func (r *commentRepo) FindRepliesPopulated(ctx context.Context, parentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	filter := bson.D{{Key: "parentComment", Value: parentID}}

	total, err := r.col.CountDocuments(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	skip := (page - 1) * limit
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: filter}},
		{{Key: "$sort", Value: bson.D{{Key: "createdAt", Value: 1}}}},
		{{Key: "$skip", Value: int64(skip)}},
		{{Key: "$limit", Value: int64(limit)}},
	}
	pipeline = append(pipeline, commentPopulatePipeline()...)

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

func (r *commentRepo) FindByStudentPopulated(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	filter := bson.D{{Key: "commentedBy", Value: studentID}}

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
	pipeline = append(pipeline, commentPopulatePipeline()...)
	pipeline = append(pipeline, bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "items"},
		{Key: "localField", Value: "item"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "itemData"},
		{Key: "pipeline", Value: bson.A{
			bson.D{{Key: "$project", Value: bson.D{
				{Key: "itemName", Value: 1},
				{Key: "type", Value: 1},
			}}},
		}},
	}}})
	pipeline = append(pipeline, bson.D{{Key: "$unwind", Value: bson.D{
		{Key: "path", Value: "$itemData"},
		{Key: "preserveNullAndEmptyArrays", Value: true},
	}}})

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

func (r *commentRepo) FindMentionsPopulated(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	filter := bson.D{{Key: "mentionedUsers", Value: studentID}}

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
	pipeline = append(pipeline, commentPopulatePipeline()...)
	pipeline = append(pipeline, bson.D{{Key: "$lookup", Value: bson.D{
		{Key: "from", Value: "items"},
		{Key: "localField", Value: "item"},
		{Key: "foreignField", Value: "_id"},
		{Key: "as", Value: "itemData"},
	}}})
	pipeline = append(pipeline, bson.D{{Key: "$unwind", Value: bson.D{
		{Key: "path", Value: "$itemData"},
		{Key: "preserveNullAndEmptyArrays", Value: true},
	}}})

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

func (r *commentRepo) CountReplies(ctx context.Context, parentID bson.ObjectID) (int64, error) {
	return r.col.CountDocuments(ctx, bson.D{{Key: "parentComment", Value: parentID}})
}

func (r *commentRepo) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Comment, error) {
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var comment model.Comment
	err := r.col.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, bson.D{{Key: "$set", Value: update}}, opts).Decode(&comment)
	if err != nil {
		return nil, err
	}
	return &comment, nil
}

func (r *commentRepo) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.col.DeleteOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}

func (r *commentRepo) DeleteReplies(ctx context.Context, parentID bson.ObjectID) error {
	_, err := r.col.DeleteMany(ctx, bson.D{{Key: "parentComment", Value: parentID}})
	return err
}

func (r *commentRepo) AddLike(ctx context.Context, id bson.ObjectID, studentID bson.ObjectID) error {
	_, err := r.col.UpdateOne(ctx,
		bson.D{{Key: "_id", Value: id}},
		bson.D{{Key: "$addToSet", Value: bson.D{{Key: "likes", Value: studentID}}}},
	)
	return err
}

func (r *commentRepo) RemoveLike(ctx context.Context, id bson.ObjectID, studentID bson.ObjectID) error {
	_, err := r.col.UpdateOne(ctx,
		bson.D{{Key: "_id", Value: id}},
		bson.D{{Key: "$pull", Value: bson.D{{Key: "likes", Value: studentID}}}},
	)
	return err
}
