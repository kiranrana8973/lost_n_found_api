import express, { Router } from 'express';
import { uploadImage, uploadVideo } from '../middleware/uploads';
import { protect } from '../middleware/auth';
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemPhoto,
  uploadItemVideo,
} from '../controllers/item_controller';

const router: Router = express.Router();

// Upload routes (protected - user must be logged in to upload)
router.post('/upload-photo', protect, uploadImage.single('itemPhoto'), uploadItemPhoto);
router.post('/upload-video', protect, uploadVideo.single('itemVideo'), uploadItemVideo);

// CRUD routes
router.post('/', protect, createItem);
router.get('/', getAllItems);
router.get('/:id', getItemById);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
