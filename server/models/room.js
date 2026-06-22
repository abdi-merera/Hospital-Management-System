const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoomSchema = new Schema(
  {
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: [true, "Please provide ward"],
    },
    roomNo: {
      type: String,
      required: [true, "Please provide room number"],
      trim: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ wardId: 1, roomNo: 1 }, { unique: true });

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;

