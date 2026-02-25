package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Item struct {
	ID          bson.ObjectID  `bson:"_id,omitempty" json:"_id"`
	ItemName    string         `bson:"itemName" json:"itemName" validate:"required"`
	Description string         `bson:"description" json:"description" validate:"required"`
	Type        string         `bson:"type" json:"type" validate:"required,oneof=lost found"`
	Category    bson.ObjectID  `bson:"category" json:"category" validate:"required"`
	Location    string         `bson:"location" json:"location" validate:"required,max=200"`
	Media       string         `bson:"media" json:"media" validate:"required"`
	MediaType   string         `bson:"mediaType" json:"mediaType" validate:"omitempty,oneof=photo video"`
	ClaimedBy   *bson.ObjectID `bson:"claimedBy,omitempty" json:"claimedBy"`
	IsClaimed   bool           `bson:"isClaimed" json:"isClaimed"`
	ReportedBy  bson.ObjectID  `bson:"reportedBy" json:"reportedBy" validate:"required"`
	Status      string         `bson:"status" json:"status" validate:"omitempty,oneof=available claimed resolved"`
	CreatedAt   time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time      `bson:"updatedAt" json:"updatedAt"`
	V           int            `bson:"__v,omitempty" json:"-"`
}

type ItemPopulated struct {
	ID          bson.ObjectID `bson:"_id" json:"_id"`
	ItemName    string        `bson:"itemName" json:"itemName"`
	Description string        `bson:"description" json:"description"`
	Type        string        `bson:"type" json:"type"`
	Category    any           `bson:"categoryData,omitempty" json:"category"`
	Location    string        `bson:"location" json:"location"`
	Media       string        `bson:"media" json:"media"`
	MediaType   string        `bson:"mediaType" json:"mediaType"`
	ClaimedBy   any           `bson:"claimedByData,omitempty" json:"claimedBy"`
	IsClaimed   bool          `bson:"isClaimed" json:"isClaimed"`
	ReportedBy  any           `bson:"reportedByData,omitempty" json:"reportedBy"`
	Status      string        `bson:"status" json:"status"`
	CreatedAt   time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time     `bson:"updatedAt" json:"updatedAt"`
}

const ItemCollection = "items"
