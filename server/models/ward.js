const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const WardSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide ward name"],
      unique: true,
      trim: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Ward = mongoose.model("Ward", WardSchema);

module.exports = Ward;

