const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BedSchema = new Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Please provide room"],
    },
    bedNo: {
      type: String,
      required: [true, "Please provide bed number"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"],
      default: "AVAILABLE",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

BedSchema.index({ roomId: 1, bedNo: 1 }, { unique: true });

const Bed = mongoose.model("Bed", BedSchema);

module.exports = Bed;

