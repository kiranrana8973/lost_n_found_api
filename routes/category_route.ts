import express, { Router } from 'express';
import { protect } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category_controller';

const router: Router = express.Router();

router.post('/', protect, createCategory);
router.get('/', cacheMiddleware('lnf:categories:all', 300), getAllCategories);
router.get('/:id', cacheMiddleware('lnf:categories:id', 300), getCategoryById);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
