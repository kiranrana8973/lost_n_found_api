import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../middleware/async';
import Item from '../models/items_model';
import path from 'path';
import fs from 'fs';

// @desc    Create a new item
// @route   POST /api/v1/items
// @access  Public
export const createItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { itemName, description, type, category, location, media, reportedBy } =
      req.body;

    // Create the item
    const item = await Item.create({
      itemName,
      description,
      type,
      category,
      location,
      media,
      reportedBy,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  }
);

// @desc    Get all items
// @route   GET /api/v1/items
// @access  Public
export const getAllItems = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, string> = {};
    if (req.query.type) filter.type = req.query.type as string;
    if (req.query.status) filter.status = req.query.status as string;
    if (req.query.category) filter.category = req.query.category as string;

    const total = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('reportedBy', 'name username')
      .populate('claimedBy', 'name username')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: items,
    });
  }
);

// @desc    Get a single item by ID
// @route   GET /api/v1/items/:id
// @access  Public
export const getItemById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name username')
      .populate('claimedBy', 'name username')
      .populate('category', 'name');

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  }
);

// @desc    Update an item
// @route   PUT /api/v1/items/:id
// @access  Private
export const updateItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const {
      itemName,
      description,
      type,
      category,
      location,
      media,
      claimedBy,
      isClaimed,
      status,
    } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Authorization check: Make sure user owns this item
    if (item.reportedBy.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        message: 'Not authorized to update this item',
      });
      return;
    }

    // Update the item fields
    item.itemName = itemName || item.itemName;
    item.description = description || item.description;
    item.type = type || item.type;
    item.category = category || item.category;
    item.location = location || item.location;
    item.media = media || item.media;
    item.claimedBy = claimedBy || item.claimedBy;
    item.isClaimed = isClaimed !== undefined ? isClaimed : item.isClaimed;
    item.status = status || item.status;

    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  }
);

// @desc    Delete an item
// @route   DELETE /api/v1/items/:id
// @access  Private
export const deleteItem = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    // Authorization check: Make sure user owns this item
    if (item.reportedBy.toString() !== req.user?._id.toString()) {
      res.status(403).json({
        message: 'Not authorized to delete this item',
      });
      return;
    }

    // Remove the item's media file if it exists
    if (item.media && item.media !== 'default.jpg') {
      // Check if it's a photo or video based on file extension
      const ext = path.extname(item.media).toLowerCase();
      let mediaPath: string | undefined;

      if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        mediaPath = path.join(__dirname, '../public/item_photos', item.media);
      } else if (['.mp4', '.avi', '.mov', '.wmv'].includes(ext)) {
        mediaPath = path.join(__dirname, '../public/item_videos', item.media);
      }

      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  }
);

// @desc    Upload Item Photo
// @route   POST /api/v1/items/upload-photo
// @access  Public
export const uploadItemPhoto = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).send({ message: 'Please upload a photo file' });
      return;
    }

    // Check for the file size
    const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '0', 10);
    if (req.file.size > maxFileUpload) {
      res.status(400).send({
        message: `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.file.filename,
      message: 'Item photo uploaded successfully',
    });
  }
);

// @desc    Upload Item Video
// @route   POST /api/v1/items/upload-video
// @access  Public
export const uploadItemVideo = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
      res.status(400).send({ message: 'Please upload a video file' });
      return;
    }

    // Check for the file size
    const maxFileUpload = parseInt(process.env.MAX_FILE_UPLOAD || '0', 10);
    if (req.file.size > maxFileUpload) {
      res.status(400).send({
        message: `Please upload a video less than ${process.env.MAX_FILE_UPLOAD} bytes`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.file.filename,
      message: 'Item video uploaded successfully',
    });
  }
);
