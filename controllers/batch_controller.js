const asyncHandler = require("../middleware/async");
const Batch = require("../models/batch_model");

// Utility for sending error responses
const sendError = (res, status, message, error = null) => {
  res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Public
exports.getBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: batches,
  });
});

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Private (Admin)
exports.createBatch = asyncHandler(async (req, res) => {
  const { batchName, status } = req.body;
  if (!batchName || !status) {
    return sendError(res, 400, "batchName and status are required");
  }
  const newBatch = await Batch.create({ batchName, status });
  res.status(201).json({
    success: true,
    data: newBatch,
  });
});

// @desc    Update a batch
// @route   PUT /api/batches/:id
// @access  Private (Admin)
exports.updateBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { batchName, status } = req.body;
  const updatedBatch = await Batch.findByIdAndUpdate(
    id,
    { batchName, status },
    { new: true, runValidators: true }
  );
  if (!updatedBatch) {
    return sendError(res, 404, "Batch not found");
  }
  res.status(200).json({
    success: true,
    data: updatedBatch,
  });
});

// @desc    Delete a batch
// @route   DELETE /api/batches/:id
// @access  Private (Admin)
exports.deleteBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedBatch = await Batch.findByIdAndDelete(id);
  if (!deletedBatch) {
    return sendError(res, 404, "Batch not found");
  }
  res.status(200).json({
    success: true,
    message: "Batch deleted successfully",
  });
});
