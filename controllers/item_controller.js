const asyncHandler = require("express-async-handler");
const Item = require("../models/items_model");
const Student = require("../models/student_model");

// Utility for sending error responses
const sendError = (res, status, message, error = null) => {
  res.status(status).json({
    success: false,
    message,
    ...(error && { error }),
  });
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public

exports.getItems = asyncHandler(async (req, res) => {
  const items = await Item.find()
    .populate("reportedBy", "name phone email profilePicture")
    .sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: items,
  });
});
