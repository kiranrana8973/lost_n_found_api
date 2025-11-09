const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Item type is required"],
      enum: ["lost", "found"],
    },
    mediaUrl: {
      type: String,
      required: [true, "Media URL is required"],
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ["photo", "video"],
      default: "photo",
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Reported by is required"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["available", "claimed", "resolved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Item", itemSchema);
