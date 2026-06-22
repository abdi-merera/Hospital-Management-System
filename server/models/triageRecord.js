const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TriageRecordSchema = new Schema(
  {
    encounterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Encounter",
      required: [true, "Please provide encounter"],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please provide patient"],
    },
    temperature: {
      type: Number,
    },
    bloodPressureSystolic: {
      type: Number,
    },
    bloodPressureDiastolic: {
      type: Number,
    },
    pulse: {
      type: Number,
    },
    respiratoryRate: {
      type: Number,
    },
    oxygenSaturation: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    height: {
      type: Number,
    },
    painScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    notes: {
      type: String,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const TriageRecord = mongoose.model("TriageRecord", TriageRecordSchema);

module.exports = TriageRecord;

