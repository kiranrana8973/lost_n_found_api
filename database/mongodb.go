package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func Connect(uri string) (*mongo.Client, *mongo.Database) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		slog.Error("failed to create MongoDB client", "error", err)
		panic(err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		slog.Error("failed to ping MongoDB", "error", err)
		panic(err)
	}

	slog.Info("MongoDB connected", "uri", uri)

	db := client.Database("lost_n_found")
	return client, db
}

func Disconnect(client *mongo.Client) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Disconnect(ctx); err != nil {
		slog.Error("failed to disconnect MongoDB", "error", err)
	}
}

func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	students := db.Collection("students")
	_, err := students.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "email", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "username", Value: 1}}, Options: options.Index().SetUnique(true)},
	})
	if err != nil {
		return fmt.Errorf("student indexes: %w", err)
	}

	batches := db.Collection("batches")
	_, err = batches.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "batchName", Value: 1}}, Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("batch indexes: %w", err)
	}

	categories := db.Collection("categories")
	_, err = categories.Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "name", Value: 1}}, Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return fmt.Errorf("category indexes: %w", err)
	}

	comments := db.Collection("comments")
	_, err = comments.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "item", Value: 1}, {Key: "createdAt", Value: -1}}},
		{Keys: bson.D{{Key: "parentComment", Value: 1}}},
		{Keys: bson.D{{Key: "commentedBy", Value: 1}}},
	})
	if err != nil {
		return fmt.Errorf("comment indexes: %w", err)
	}

	refreshTokens := db.Collection("refreshtokens")
	_, err = refreshTokens.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{Keys: bson.D{{Key: "token", Value: 1}}},
		{Keys: bson.D{{Key: "student", Value: 1}}},
		{Keys: bson.D{{Key: "expiresAt", Value: 1}}, Options: options.Index().SetExpireAfterSeconds(0)},
	})
	if err != nil {
		return fmt.Errorf("refresh token indexes: %w", err)
	}

	slog.Info("MongoDB indexes ensured")
	return nil
}
