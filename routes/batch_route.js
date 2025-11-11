const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { cache } = require("../middleware/cache");

const {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
} = require("../controllers/batch_controller");

router.post("/", createBatch);
router.get("/", cache(1800), getAllBatches); // Cache for 30 minutes
router.get("/:id", cache(1800), getBatchById); // Cache for 30 minutes
router.put("/:id", protect, updateBatch);

module.exports = router;
