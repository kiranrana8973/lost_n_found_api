package repository

import (
	"context"

	"github.com/kiranrana/lost-n-found-api/model"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type RefreshTokenRepository interface {
	Create(ctx context.Context, token *model.RefreshToken) error
	FindByToken(ctx context.Context, hashedToken string) (*model.RefreshToken, error)
	DeleteByToken(ctx context.Context, hashedToken string) error
	DeleteByStudent(ctx context.Context, studentID bson.ObjectID) error
}

type refreshTokenRepo struct {
	col *mongo.Collection
}

func NewRefreshTokenRepo(db *mongo.Database) RefreshTokenRepository {
	return &refreshTokenRepo{col: db.Collection(model.RefreshTokenCollection)}
}

func (r *refreshTokenRepo) Create(ctx context.Context, token *model.RefreshToken) error {
	_, err := r.col.InsertOne(ctx, token)
	return err
}

func (r *refreshTokenRepo) FindByToken(ctx context.Context, hashedToken string) (*model.RefreshToken, error) {
	var rt model.RefreshToken
	err := r.col.FindOne(ctx, bson.D{{Key: "token", Value: hashedToken}}).Decode(&rt)
	if err != nil {
		return nil, err
	}
	return &rt, nil
}

func (r *refreshTokenRepo) DeleteByToken(ctx context.Context, hashedToken string) error {
	_, err := r.col.DeleteOne(ctx, bson.D{{Key: "token", Value: hashedToken}})
	return err
}

func (r *refreshTokenRepo) DeleteByStudent(ctx context.Context, studentID bson.ObjectID) error {
	_, err := r.col.DeleteMany(ctx, bson.D{{Key: "student", Value: studentID}})
	return err
}
