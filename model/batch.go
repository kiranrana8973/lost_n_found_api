package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Batch struct {
	ID        bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	BatchName string        `bson:"batchName" json:"batchName" validate:"required,min=2,max=50"`
	Status    string        `bson:"status" json:"status" validate:"omitempty,oneof=active completed cancelled"`
	CreatedAt time.Time     `bson:"createdAt" json:"createdAt"`
	V         int           `bson:"__v,omitempty" json:"-"`
}

const BatchCollection = "batches"
