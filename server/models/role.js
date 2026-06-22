const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RoleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide role name"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    systemRole: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", RoleSchema);

module.exports = Role;

