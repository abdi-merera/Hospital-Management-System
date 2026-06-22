const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuditLogSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      required: [true, "Please provide audit action"],
      trim: true,
    },
    entity: {
      type: String,
      required: [true, "Please provide audit entity"],
      trim: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);

module.exports = AuditLog;

