import { Request, Response } from 'express';
import asyncHandler from '../middleware/async';
import Comment, { IComment } from '../models/comment_model';
import Student from '../models/student_model';
import Item from '../models/items_model';
import { Types } from 'mongoose';

// Helper function to extract mentions from text
const extractMentions = (text: string): string[] => {
  // Match @username patterns
  const mentionPattern = /@(\w+)/g;
  const mentions: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push(match[1]); // Extract username without @
  }

  return mentions;
};

// @desc    Create a new comment or reply
// @route   POST /api/v1/comments
// @access  Public (should be protected in production)
export const createComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { text, itemId, commentedBy, parentCommentId } = req.body;

    // Validate required fields
    if (!text || !itemId || !commentedBy) {
      res.status(400).json({
        success: false,
        message: 'Please provide text, itemId, and commentedBy',
      });
      return;
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    // Check if commenter exists
    const commenter = await Student.findById(commentedBy);
    if (!commenter) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    // Extract mentioned usernames from text
    const mentionedUsernames = extractMentions(text);
    const mentionedUsers: Types.ObjectId[] = [];

    // Find mentioned users by username
    if (mentionedUsernames.length > 0) {
      const users = await Student.find({
        username: { $in: mentionedUsernames },
      });
      mentionedUsers.push(...users.map((user) => user._id));
    }

    // Check if this is a reply
    let isReply = false;
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        res.status(404).json({
          success: false,
          message: 'Parent comment not found',
        });
        return;
      }
      isReply = true;
    }

    // Create comment
    const comment = await Comment.create({
      text,
      item: itemId,
      commentedBy,
      mentionedUsers,
      parentComment: parentCommentId || null,
      isReply,
    });

    // Populate the comment before sending response
    await comment.populate([
      { path: 'commentedBy', select: 'name username profilePicture' },
      { path: 'mentionedUsers', select: 'name username' },
    ]);

    res.status(201).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    Get all comments for an item
// @route   GET /api/v1/comments/item/:itemId
// @access  Public
export const getCommentsByItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { itemId } = req.params;
    const { includeReplies, page = '1', limit = '10' } = req.query;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Item not found',
      });
      return;
    }

    const query: Record<string, unknown> = { item: itemId };

    // If includeReplies is false, only get main comments (not replies)
    if (includeReplies !== 'true') {
      query.isReply = false;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments(query);

    const comments = await Comment.find(query)
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .populate('likes', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If we're getting main comments, also get reply counts
    if (includeReplies !== 'true') {
      for (const comment of comments) {
        const replyCount = await Comment.countDocuments({
          parentComment: comment._id,
        });
        (comment as IComment & { replyCount: number }).replyCount = replyCount;
      }
    }

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: comments,
    });
  }
);

// @desc    Get replies for a specific comment
// @route   GET /api/v1/comments/:commentId/replies
// @access  Public
export const getRepliesByComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments({ parentComment: commentId });

    const replies = await Comment.find({ parentComment: commentId })
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .populate('likes', 'name username')
      .sort({ createdAt: 1 }) // Oldest first for replies
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: replies.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: replies,
    });
  }
);

// @desc    Update a comment
// @route   PUT /api/v1/comments/:id
// @access  Private
export const updateComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        message: 'Please provide text to update',
      });
      return;
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    // Authorization check: Make sure user owns this comment
    if (comment.commentedBy.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment',
      });
      return;
    }

    // Extract new mentions
    const mentionedUsernames = extractMentions(text);
    const mentionedUsers: Types.ObjectId[] = [];

    if (mentionedUsernames.length > 0) {
      const users = await Student.find({
        username: { $in: mentionedUsernames },
      });
      mentionedUsers.push(...users.map((user) => user._id));
    }

    // Update comment
    comment.text = text;
    comment.mentionedUsers = mentionedUsers;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    await comment.populate([
      { path: 'commentedBy', select: 'name username profilePicture' },
      { path: 'mentionedUsers', select: 'name username' },
    ]);

    res.status(200).json({
      success: true,
      data: comment,
    });
  }
);

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private
export const deleteComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    // Authorization check: Make sure user owns this comment
    if (comment.commentedBy.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment',
      });
      return;
    }

    // If this is a parent comment, also delete all replies
    if (!comment.isReply) {
      await Comment.deleteMany({ parentComment: comment._id });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  }
);

// @desc    Like/Unlike a comment
// @route   POST /api/v1/comments/:id/like
// @access  Public (should be protected)
export const toggleLike = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { studentId } = req.body;

    if (!studentId) {
      res.status(400).json({
        success: false,
        message: 'Please provide studentId',
      });
      return;
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
      return;
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    // Check if already liked
    const studentObjectId = new Types.ObjectId(studentId);
    const likeIndex = comment.likes.findIndex(
      (id) => id.toString() === studentObjectId.toString()
    );

    if (likeIndex > -1) {
      // Unlike - remove from likes array
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like - add to likes array
      comment.likes.push(studentObjectId);
    }

    await comment.save();

    await comment.populate('likes', 'name username');

    res.status(200).json({
      success: true,
      liked: likeIndex === -1,
      likeCount: comment.likes.length,
      data: comment,
    });
  }
);

// @desc    Get all comments by a student
// @route   GET /api/v1/comments/student/:studentId
// @access  Public
export const getCommentsByStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { studentId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments({ commentedBy: studentId });

    const comments = await Comment.find({ commentedBy: studentId })
      .populate('item', 'itemName type')
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: comments,
    });
  }
);

// @desc    Get comments where a student is mentioned
// @route   GET /api/v1/comments/mentions/:studentId
// @access  Public
export const getMentionsByStudent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { studentId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Comment.countDocuments({ mentionedUsers: studentId });

    const comments = await Comment.find({ mentionedUsers: studentId })
      .populate('item', 'itemName type')
      .populate('commentedBy', 'name username profilePicture')
      .populate('mentionedUsers', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: comments.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: comments,
    });
  }
);
