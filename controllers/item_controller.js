const asyncHandler = require("../middleware/async");
const Item = require("../models/items_model");
const path = require("path");
const fs = require("fs");

// @desc    Create a new item
// @route   POST /api/v1/items
// @access  Public
exports.createItem = asyncHandler(async (req, res) => {
  const { itemName, description, type, mediaUrl, reportedBy } = req.body;

  // Create the item
  const item = await Item.create({
    itemName,
    description,
    type,
    mediaUrl,
    reportedBy,
  });

  res.status(201).json({
    success: true,
    data: item,
  });
});

// @desc    Get all items
// @route   GET /api/v1/items
// @access  Public
exports.getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find()
    .populate("reportedBy", "name username")
    .populate("claimedBy", "name username");

  res.status(200).json({
    success: true,
    count: items.length,
    data: items,
  });
});

// @desc    Get a single item by ID
// @route   GET /api/v1/items/:id
// @access  Public
exports.getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id)
    .populate("reportedBy", "name username")
    .populate("claimedBy", "name username");

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  res.status(200).json({
    success: true,
    data: item,
  });
});

// @desc    Update an item
// @route   PUT /api/v1/items/:id
// @access  Public
exports.updateItem = asyncHandler(async (req, res) => {
  const { itemName, description, type, mediaUrl, claimedBy, isClaimed, status } =
    req.body;

  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Update the item fields
  item.itemName = itemName || item.itemName;
  item.description = description || item.description;
  item.type = type || item.type;
  item.mediaUrl = mediaUrl || item.mediaUrl;
  item.claimedBy = claimedBy || item.claimedBy;
  item.isClaimed = isClaimed !== undefined ? isClaimed : item.isClaimed;
  item.status = status || item.status;

  await item.save();

  res.status(200).json({
    success: true,
    data: item,
  });
});

// @desc    Delete an item
// @route   DELETE /api/v1/items/:id
// @access  Public
exports.deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Remove the item's media file if it exists
  if (item.mediaUrl && item.mediaUrl !== "default.jpg") {
    // Check if it's a photo or video based on file extension
    const ext = path.extname(item.mediaUrl).toLowerCase();
    let mediaPath;

    if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) {
      mediaPath = path.join(__dirname, "../public/item_photos", item.mediaUrl);
    } else if ([".mp4", ".avi", ".mov", ".wmv"].includes(ext)) {
      mediaPath = path.join(__dirname, "../public/item_videos", item.mediaUrl);
    }

    if (mediaPath && fs.existsSync(mediaPath)) {
      fs.unlinkSync(mediaPath);
    }
  }

  await Item.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Item deleted successfully",
  });
});

// @desc    Upload Item Photo
// @route   POST /api/v1/items/upload-photo
// @access  Public
exports.uploadItemPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a photo file" });
  }

  res.status(200).json({
    success: true,
    data: req.file.filename,
    message: "Item photo uploaded successfully",
  });
});

// @desc    Upload Item Video
// @route   POST /api/v1/items/upload-video
// @access  Public
exports.uploadItemVideo = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a video file" });
  }

  res.status(200).json({
    success: true,
    data: req.file.filename,
    message: "Item video uploaded successfully",
  });
});
