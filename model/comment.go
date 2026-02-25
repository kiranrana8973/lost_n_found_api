package model

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Comment struct {
	ID             bson.ObjectID   `bson:"_id,omitempty" json:"_id"`
	Text           string          `bson:"text" json:"text" validate:"required"`
	Item           bson.ObjectID   `bson:"item" json:"item" validate:"required"`
	CommentedBy    bson.ObjectID   `bson:"commentedBy" json:"commentedBy" validate:"required"`
	MentionedUsers []bson.ObjectID `bson:"mentionedUsers" json:"mentionedUsers"`
	ParentComment  *bson.ObjectID  `bson:"parentComment,omitempty" json:"parentComment"`
	IsReply        bool            `bson:"isReply" json:"isReply"`
	Likes          []bson.ObjectID `bson:"likes" json:"likes"`
	IsEdited       bool            `bson:"isEdited" json:"isEdited"`
	EditedAt       *time.Time      `bson:"editedAt,omitempty" json:"editedAt"`
	ReplyCount     int             `bson:"-" json:"replyCount,omitempty"`
	CreatedAt      time.Time       `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time       `bson:"updatedAt" json:"updatedAt"`
	V              int             `bson:"__v,omitempty" json:"-"`
}

// CommentPopulated is used for responses with populated references.
type CommentPopulated struct {
	ID             bson.ObjectID `bson:"_id" json:"_id"`
	Text           string        `bson:"text" json:"text"`
	Item           any           `bson:"itemData,omitempty" json:"item"`
	CommentedBy    any           `bson:"commentedByData,omitempty" json:"commentedBy"`
	MentionedUsers any           `bson:"mentionedUsersData,omitempty" json:"mentionedUsers"`
	ParentComment  *bson.ObjectID `bson:"parentComment,omitempty" json:"parentComment"`
	IsReply        bool          `bson:"isReply" json:"isReply"`
	Likes          any           `bson:"likesData,omitempty" json:"likes"`
	IsEdited       bool          `bson:"isEdited" json:"isEdited"`
	EditedAt       *time.Time    `bson:"editedAt,omitempty" json:"editedAt"`
	ReplyCount     int           `bson:"replyCount,omitempty" json:"replyCount,omitempty"`
	CreatedAt      time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time     `bson:"updatedAt" json:"updatedAt"`
}

const CommentCollection = "comments"
