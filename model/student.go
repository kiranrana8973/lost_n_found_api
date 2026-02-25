package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Student struct {
	ID             bson.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name           string        `bson:"name" json:"name" validate:"required"`
	Email          string        `bson:"email" json:"email" validate:"required,email"`
	Username       string        `bson:"username" json:"username" validate:"required"`
	Password       string        `bson:"password" json:"password,omitempty" validate:"required,min=6"`
	PhoneNumber    string        `bson:"phoneNumber" json:"phoneNumber" validate:"required"`
	BatchID        bson.ObjectID `bson:"batchId" json:"batchId" validate:"required"`
	ProfilePicture string        `bson:"profilePicture" json:"profilePicture"`
	Role           string        `bson:"role,omitempty" json:"role,omitempty"`
	CreatedAt      time.Time     `bson:"createdAt" json:"createdAt"`
	V              int           `bson:"__v,omitempty" json:"-"`
}

type StudentResponse struct {
	ID             bson.ObjectID `json:"_id"`
	Name           string        `json:"name"`
	Email          string        `json:"email"`
	Username       string        `json:"username"`
	PhoneNumber    string        `json:"phoneNumber"`
	BatchID        any           `json:"batchId"`
	ProfilePicture string        `json:"profilePicture"`
	Role           string        `json:"role,omitempty"`
	CreatedAt      time.Time     `json:"createdAt"`
}

func (s *Student) ToResponse() StudentResponse {
	return StudentResponse{
		ID:             s.ID,
		Name:           s.Name,
		Email:          s.Email,
		Username:       s.Username,
		PhoneNumber:    s.PhoneNumber,
		BatchID:        s.BatchID,
		ProfilePicture: s.ProfilePicture,
		Role:           s.Role,
		CreatedAt:      s.CreatedAt,
	}
}

const StudentCollection = "students"
