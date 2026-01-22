import express, { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createComment,
  getCommentsByItem,
  getRepliesByComment,
  updateComment,
  deleteComment,
  toggleLike,
  getCommentsByStudent,
  getMentionsByStudent,
} from '../controllers/comment_controller';

const router: Router = express.Router();

// Comment CRUD routes
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

// Get comments by item
router.get('/item/:itemId', getCommentsByItem);

// Get replies for a comment
router.get('/:commentId/replies', getRepliesByComment);

// Like/Unlike a comment
router.post('/:id/like', protect, toggleLike);

// Get comments by student
router.get('/student/:studentId', getCommentsByStudent);

// Get mentions for a student
router.get('/mentions/:studentId', getMentionsByStudent);

export default router;
