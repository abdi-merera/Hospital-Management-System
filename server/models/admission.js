const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdmissionSchema = new Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide patient"],
    },
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Encounter",
      required: [true, "Please provide encounter"],
    },
    status: {
      type: String,
      enum: ["ADMITTED", "TRANSFERRED", "DISCHARGED", "CANCELLED"],
      default: "ADMITTED",
    },
    reason: {
      type: String,
    },
    admittedAt: {
      type: Date,
      default: Date.now,
    },
    dischargedAt: {
      type: Date,
    },
    dischargeSummary: {
      type: String,
    },
    admittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dischargedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Admission = mongoose.model("Admission", AdmissionSchema);

module.exports = Admission;

