import { Request, Response } from 'express';
import asyncHandler from '../middleware/async';
import Batch from '../models/batch_model';

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (Admin)
export const createBatch = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { batchName, status } = req.body;

    if (!batchName || typeof batchName !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Batch name is required',
      });
      return;
    }

    const batch = await Batch.create({
      batchName: batchName.trim(),
      status,
    });

    res.status(201).json({
      success: true,
      data: batch,
    });
  }
);

// @desc    Get all batches
// @route   GET /api/batches
// @access  Private (Admin)
export const getAllBatches = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const batches = await Batch.find();

    res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  }
);

// @desc    Get a single batch by ID
// @route   GET /api/batches/:id
// @access  Private (Admin)
export const getBatchById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      res.status(404).json({ message: 'Batch not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  }
);

// @desc    Update a batch by ID
// @route   PUT /api/batches/:id
// @access  Private (Admin)
export const updateBatch = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { batchName } = req.body;

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { batchName },
      { new: true, runValidators: true }
    );

    if (!batch) {
      res.status(404).json({ message: 'Batch not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: batch,
    });
  }
);
