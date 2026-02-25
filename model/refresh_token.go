package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type RefreshToken struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Token     string        `bson:"token" json:"-"`
	Student   bson.ObjectID `bson:"student" json:"student"`
	ExpiresAt time.Time     `bson:"expiresAt" json:"expiresAt"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
}

const RefreshTokenCollection = "refreshtokens"
