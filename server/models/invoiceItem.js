const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InvoiceItemSchema = new Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: [true, "Please provide invoice"],
    },
    description: {
      type: String,
      required: [true, "Please provide item description"],
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["CONSULTATION", "LAB", "RADIOLOGY", "PHARMACY", "WARD", "PROCEDURE", "OTHER"],
      default: "OTHER",
    },
  },
  {
    timestamps: true,
  }
);

const InvoiceItem = mongoose.model("InvoiceItem", InvoiceItemSchema);

module.exports = InvoiceItem;

