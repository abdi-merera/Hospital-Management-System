const User = require("../models/user.js");
const Appointment = require("../models/appointment.js");
const Prescription = require("../models/prescription.js");
const mongoose = require("mongoose");
const moment = require('moment');

const getUserCountByRole = async (req, res) => {
    try {
        const userType = req.body.userType;
        if (!userType) {
            return res.status(400).json({ errors: ["User type is missing in body"] });
        }
        const count = await User.countDocuments({ userType });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ errors: [error.message] });
    }
}

const getAppointmentCount = async (req, res) => {
    try {
        const query = {
            appointmentDate: moment(new Date()).format('YYYY-MM-DD'),
            isTimeSlotAvailable: false,
        };
        if (req.sender.doctorId) query.doctorId = req.sender.doctorId;
        if (req.sender.patientId) query.patientId = req.sender.patientId;

        const totalAppointments = await Appointment.countDocuments(query);
        const pendingAppointments = await Appointment.countDocuments({ ...query, completed: false });

        res.json({ message: "success", totalAppointments, pendingAppointments });
    } catch (error) {
        res.status(500).json({ errors: [error.message] });
    }
}

const getPatientsTreatedCount = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({}).populate({
            path: 'appointmentId',
            populate: {
                path: 'doctorId',
                match: { _id: new mongoose.Types.ObjectId(req.sender.doctorId) }
            }
        });
        const count = prescriptions.filter(pre => pre.appointmentId?.doctorId != null).length;
        res.json({ message: "success", treatedPatients: count });
    } catch (error) {
        res.status(500).json({ errors: [error.message] });
    }
}

module.exports = { getUserCountByRole, getAppointmentCount, getPatientsTreatedCount };
