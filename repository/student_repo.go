package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type StudentRepository interface {
	Create(ctx context.Context, student *model.Student) (*model.Student, error)
	FindByID(ctx context.Context, id bson.ObjectID) (*model.Student, error)
	FindByIDWithPassword(ctx context.Context, id bson.ObjectID) (*model.Student, error)
	FindByEmail(ctx context.Context, email string) (*model.Student, error)
	FindByUsername(ctx context.Context, username string) (*model.Student, error)
	FindByUsernameCaseInsensitive(ctx context.Context, username string) (*model.Student, error)
	FindByUsernames(ctx context.Context, usernames []string) ([]model.Student, error)
	FindAll(ctx context.Context) ([]model.Student, error)
	FindAllPopulated(ctx context.Context) ([]bson.Raw, error)
	FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error)
	Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Student, error)
	Delete(ctx context.Context, id bson.ObjectID) error
}

type studentRepo struct {
	col *mongo.Collection
}

func NewStudentRepo(db *mongo.Database) StudentRepository {
	return &studentRepo{col: db.Collection(model.StudentCollection)}
}

func (r *studentRepo) Create(ctx context.Context, student *model.Student) (*model.Student, error) {
	result, err := r.col.InsertOne(ctx, student)
	if err != nil {
		return nil, err
	}
	student.ID = result.InsertedID.(bson.ObjectID)
	return student, nil
}

func (r *studentRepo) FindByID(ctx context.Context, id bson.ObjectID) (*model.Student, error) {
	var student model.Student
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}},
		options.FindOne().SetProjection(bson.D{{Key: "password", Value: 0}}),
	).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) FindByIDWithPassword(ctx context.Context, id bson.ObjectID) (*model.Student, error) {
	var student model.Student
	err := r.col.FindOne(ctx, bson.D{{Key: "_id", Value: id}}).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) FindByEmail(ctx context.Context, email string) (*model.Student, error) {
	var student model.Student
	err := r.col.FindOne(ctx, bson.D{{Key: "email", Value: email}}).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) FindByUsername(ctx context.Context, username string) (*model.Student, error) {
	var student model.Student
	err := r.col.FindOne(ctx, bson.D{{Key: "username", Value: username}}).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) FindByUsernameCaseInsensitive(ctx context.Context, username string) (*model.Student, error) {
	var student model.Student
	opts := options.FindOne().SetCollation(&options.Collation{Locale: "en", Strength: 2})
	err := r.col.FindOne(ctx, bson.D{{Key: "username", Value: username}}, opts).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) FindByUsernames(ctx context.Context, usernames []string) ([]model.Student, error) {
	filter := bson.D{{Key: "username", Value: bson.D{{Key: "$in", Value: usernames}}}}
	opts := options.Find().SetCollation(&options.Collation{Locale: "en", Strength: 2})
	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	var students []model.Student
	if err := cursor.All(ctx, &students); err != nil {
		return nil, err
	}
	return students, nil
}

func (r *studentRepo) FindAll(ctx context.Context) ([]model.Student, error) {
	cursor, err := r.col.Find(ctx, bson.D{},
		options.Find().SetProjection(bson.D{{Key: "password", Value: 0}}),
	)
	if err != nil {
		return nil, err
	}
	var students []model.Student
	if err := cursor.All(ctx, &students); err != nil {
		return nil, err
	}
	return students, nil
}

func (r *studentRepo) FindAllPopulated(ctx context.Context) ([]bson.Raw, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$project", Value: bson.D{{Key: "password", Value: 0}}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "batches"},
			{Key: "localField", Value: "batchId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "batchId"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{{Key: "batchName", Value: 1}}}},
			}},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$batchId"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
	}
	cursor, err := r.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	var results []bson.Raw
	if err := cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

func (r *studentRepo) FindByIDPopulated(ctx context.Context, id bson.ObjectID) (bson.Raw, error) {
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.D{{Key: "_id", Value: id}}}},
		{{Key: "$project", Value: bson.D{{Key: "password", Value: 0}}}},
		{{Key: "$lookup", Value: bson.D{
			{Key: "from", Value: "batches"},
			{Key: "localField", Value: "batchId"},
			{Key: "foreignField", Value: "_id"},
			{Key: "as", Value: "batchId"},
			{Key: "pipeline", Value: bson.A{
				bson.D{{Key: "$project", Value: bson.D{{Key: "batchName", Value: 1}}}},
			}},
		}}},
		{{Key: "$unwind", Value: bson.D{
			{Key: "path", Value: "$batchId"},
			{Key: "preserveNullAndEmptyArrays", Value: true},
		}}},
	}
	cursor, err := r.col.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	if cursor.Next(ctx) {
		return cursor.Current, nil
	}
	return nil, mongo.ErrNoDocuments
}

func (r *studentRepo) Update(ctx context.Context, id bson.ObjectID, update bson.D) (*model.Student, error) {
	opts := options.FindOneAndUpdate().
		SetReturnDocument(options.After).
		SetProjection(bson.D{{Key: "password", Value: 0}})
	var student model.Student
	err := r.col.FindOneAndUpdate(ctx, bson.D{{Key: "_id", Value: id}}, bson.D{{Key: "$set", Value: update}}, opts).Decode(&student)
	if err != nil {
		return nil, err
	}
	return &student, nil
}

func (r *studentRepo) Delete(ctx context.Context, id bson.ObjectID) error {
	result, err := r.col.DeleteOne(ctx, bson.D{{Key: "_id", Value: id}})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return mongo.ErrNoDocuments
	}
	return nil
}
