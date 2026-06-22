const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: [true, "Please provide invoice"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide payment amount"],
    },
    method: {
      type: String,
      enum: ["CASH", "CARD", "MOBILE_MONEY", "INSURANCE", "BANK_TRANSFER"],
      default: "CASH",
    },
    reference: {
      type: String,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;

