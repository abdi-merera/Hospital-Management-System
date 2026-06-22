const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PermissionSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "Please provide permission code"],
      unique: true,
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

const Permission = mongoose.model("Permission", PermissionSchema);

module.exports = Permission;

