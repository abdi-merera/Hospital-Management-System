const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DiagnosisSchema = new Schema(
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
    code: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please provide diagnosis description"],
    },
    diagnosisType: {
      type: String,
      enum: ["PRIMARY", "SECONDARY", "DIFFERENTIAL"],
      default: "PRIMARY",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "RESOLVED", "RULED_OUT"],
      default: "ACTIVE",
    },
    diagnosedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    diagnosedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Diagnosis = mongoose.model("Diagnosis", DiagnosisSchema);

module.exports = Diagnosis;

