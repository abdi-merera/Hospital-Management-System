const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  phone: {
    type: String
  },
  department: {
    type: String
  },
  address: {
    type: String
  }
});

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;
