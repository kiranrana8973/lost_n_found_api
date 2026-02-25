package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Category struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name        string        `bson:"name" json:"name" validate:"required,min=2,max=50"`
	Description string        `bson:"description,omitempty" json:"description" validate:"omitempty,max=200"`
	Status      string        `bson:"status" json:"status" validate:"omitempty,oneof=active inactive"`
	CreatedAt   time.Time     `bson:"createdAt" json:"createdAt"`
	V           int           `bson:"__v,omitempty" json:"-"`
}

const CategoryCollection = "categories"
