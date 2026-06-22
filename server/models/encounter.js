const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const EncounterSchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide patient"],
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    type: {
      type: String,
      enum: ["OUTPATIENT", "EMERGENCY", "FOLLOW_UP"],
      required: [true, "Please provide encounter type"],
    },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "WAITING_TRIAGE", "IN_TRIAGE", "READY_FOR_DOCTOR", "IN_CONSULTATION", "OPEN", "CLOSED", "CANCELLED"],
      default: "PENDING_PAYMENT",
    },
    reason: {
      type: String,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    paymentException: {
      type: Boolean,
      default: false,
    },
    paymentExceptionReason: {
      type: String,
    },
    paymentExceptionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentExceptionAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Encounter = mongoose.model("Encounter", EncounterSchema);

module.exports = Encounter;
