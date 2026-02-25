package service

import (
	"context"
	"errors"
	"regexp"
	"strings"
	"time"

	"github.com/kiranrana/lost-n-found-api/apperror"
	"github.com/kiranrana/lost-n-found-api/model"
	"github.com/kiranrana/lost-n-found-api/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

var mentionPattern = regexp.MustCompile(`@(\w+)`)

type CommentService struct {
	commentRepo repository.CommentRepository
	studentRepo repository.StudentRepository
	itemRepo    repository.ItemRepository
}

func NewCommentService(cr repository.CommentRepository, sr repository.StudentRepository, ir repository.ItemRepository) *CommentService {
	return &CommentService{commentRepo: cr, studentRepo: sr, itemRepo: ir}
}

func extractMentions(text string) []string {
	matches := mentionPattern.FindAllStringSubmatch(text, -1)
	usernames := make([]string, 0, len(matches))
	for _, match := range matches {
		usernames = append(usernames, match[1])
	}
	return usernames
}

func (s *CommentService) Create(ctx context.Context, text string, itemID, commentedBy bson.ObjectID, parentCommentID *bson.ObjectID) (bson.Raw, error) {
	// Validate item exists
	_, err := s.itemRepo.FindByID(ctx, itemID)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Item not found")
		}
		return nil, err
	}

	// Validate student exists
	_, err = s.studentRepo.FindByID(ctx, commentedBy)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Student not found")
		}
		return nil, err
	}

	// If reply, validate parent comment exists
	isReply := false
	if parentCommentID != nil {
		parent, err := s.commentRepo.FindByID(ctx, *parentCommentID)
		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return nil, apperror.NotFound("Parent comment not found")
			}
			return nil, err
		}
		_ = parent
		isReply = true
	}

	// Extract mentions
	usernames := extractMentions(text)
	var mentionedUserIDs []bson.ObjectID
	if len(usernames) > 0 {
		students, err := s.studentRepo.FindByUsernames(ctx, usernames)
		if err == nil {
			for _, st := range students {
				mentionedUserIDs = append(mentionedUserIDs, st.ID)
			}
		}
	}
	if mentionedUserIDs == nil {
		mentionedUserIDs = []bson.ObjectID{}
	}

	now := time.Now()
	comment := &model.Comment{
		Text:           strings.TrimSpace(text),
		Item:           itemID,
		CommentedBy:    commentedBy,
		MentionedUsers: mentionedUserIDs,
		ParentComment:  parentCommentID,
		IsReply:        isReply,
		Likes:          []bson.ObjectID{},
		IsEdited:       false,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	created, err := s.commentRepo.Create(ctx, comment)
	if err != nil {
		return nil, err
	}

	return s.commentRepo.FindByIDPopulated(ctx, created.ID)
}

func (s *CommentService) GetByItem(ctx context.Context, itemID bson.ObjectID, includeReplies bool, page, limit int) ([]bson.Raw, int64, error) {
	return s.commentRepo.FindByItemPopulated(ctx, itemID, includeReplies, page, limit)
}

func (s *CommentService) GetReplies(ctx context.Context, parentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	return s.commentRepo.FindRepliesPopulated(ctx, parentID, page, limit)
}

func (s *CommentService) GetByStudent(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	return s.commentRepo.FindByStudentPopulated(ctx, studentID, page, limit)
}

func (s *CommentService) GetMentions(ctx context.Context, studentID bson.ObjectID, page, limit int) ([]bson.Raw, int64, error) {
	return s.commentRepo.FindMentionsPopulated(ctx, studentID, page, limit)
}

func (s *CommentService) Update(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID, text string) (bson.Raw, error) {
	comment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Comment not found")
		}
		return nil, err
	}

	if comment.CommentedBy != requestorID {
		return nil, apperror.Forbidden("You can only update your own comments")
	}

	// Re-extract mentions
	usernames := extractMentions(text)
	var mentionedUserIDs []bson.ObjectID
	if len(usernames) > 0 {
		students, err := s.studentRepo.FindByUsernames(ctx, usernames)
		if err == nil {
			for _, st := range students {
				mentionedUserIDs = append(mentionedUserIDs, st.ID)
			}
		}
	}
	if mentionedUserIDs == nil {
		mentionedUserIDs = []bson.ObjectID{}
	}

	now := time.Now()
	update := bson.D{
		{Key: "text", Value: strings.TrimSpace(text)},
		{Key: "mentionedUsers", Value: mentionedUserIDs},
		{Key: "isEdited", Value: true},
		{Key: "editedAt", Value: now},
		{Key: "updatedAt", Value: now},
	}

	_, err = s.commentRepo.Update(ctx, id, update)
	if err != nil {
		return nil, err
	}

	return s.commentRepo.FindByIDPopulated(ctx, id)
}

func (s *CommentService) Delete(ctx context.Context, id bson.ObjectID, requestorID bson.ObjectID) error {
	comment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return apperror.NotFound("Comment not found")
		}
		return err
	}

	if comment.CommentedBy != requestorID {
		return apperror.Forbidden("You can only delete your own comments")
	}

	// If parent comment, delete all replies
	if !comment.IsReply {
		if err := s.commentRepo.DeleteReplies(ctx, id); err != nil {
			return err
		}
	}

	return s.commentRepo.Delete(ctx, id)
}

type ToggleLikeResult struct {
	Liked     bool  `json:"liked"`
	LikeCount int   `json:"likeCount"`
	Comment   bson.Raw `json:"comment"`
}

func (s *CommentService) ToggleLike(ctx context.Context, id bson.ObjectID, studentID bson.ObjectID) (*ToggleLikeResult, error) {
	comment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, apperror.NotFound("Comment not found")
		}
		return nil, err
	}

	// Check if already liked
	alreadyLiked := false
	for _, likeID := range comment.Likes {
		if likeID == studentID {
			alreadyLiked = true
			break
		}
	}

	if alreadyLiked {
		if err := s.commentRepo.RemoveLike(ctx, id, studentID); err != nil {
			return nil, err
		}
	} else {
		if err := s.commentRepo.AddLike(ctx, id, studentID); err != nil {
			return nil, err
		}
	}

	// Get updated comment
	populated, err := s.commentRepo.FindByIDPopulated(ctx, id)
	if err != nil {
		return nil, err
	}

	updatedComment, err := s.commentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return &ToggleLikeResult{
		Liked:     !alreadyLiked,
		LikeCount: len(updatedComment.Likes),
		Comment:   populated,
	}, nil
}
