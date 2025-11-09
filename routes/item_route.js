const express = require("express");
const router = express.Router();
const { uploadImage, uploadVideo } = require("../middleware/uploads");
const { protect } = require("../middleware/auth");

const {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemPhoto,
  uploadItemVideo,
} = require("../controllers/item_controller");

// Upload routes
router.post("/upload-photo", uploadImage.single("itemPhoto"), uploadItemPhoto);
router.post("/upload-video", uploadVideo.single("itemVideo"), uploadItemVideo);

// CRUD routes
router.post("/", protect, createItem);
router.get("/", getAllItems);
router.get("/:id", getItemById);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;
