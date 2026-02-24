import express, { Router } from 'express';
import { protect } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';
import {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
} from '../controllers/batch_controller';

const router: Router = express.Router();

router.post('/', protect, createBatch);
router.get('/', cacheMiddleware('lnf:batches:all', 300), getAllBatches);
router.get('/:id', cacheMiddleware('lnf:batches:id', 300), getBatchById);
router.put('/:id', protect, updateBatch);

export default router;
