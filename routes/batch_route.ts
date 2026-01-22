import express, { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
} from '../controllers/batch_controller';

const router: Router = express.Router();

router.post('/', protect, createBatch);
router.get('/', getAllBatches);
router.get('/:id', getBatchById);
router.put('/:id', protect, updateBatch);

export default router;
