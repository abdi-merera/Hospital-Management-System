const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  medicalRecordNo: {
    type: String,
    unique: true,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  region: {
    type: String
  },
  city: {
    type: String
  },
  woreda: {
    type: String
  },
  age: {
    type: Number
  },
  gender: {
    type: String
  },
  dob: {
    type: String
  }
});

const Patient = mongoose.model("Patient", PatientSchema);

module.exports = Patient;
