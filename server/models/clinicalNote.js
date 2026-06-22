const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ClinicalNoteSchema = new Schema(
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
    noteType: {
      type: String,
      enum: ["SOAP", "PROGRESS", "DISCHARGE", "GENERAL"],
      default: "SOAP",
    },
    subjective: {
      type: String,
    },
    objective: {
      type: String,
    },
    assessment: {
      type: String,
    },
    plan: {
      type: String,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const ClinicalNote = mongoose.model("ClinicalNote", ClinicalNoteSchema);

module.exports = ClinicalNote;

