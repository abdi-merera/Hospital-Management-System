const Patient = require("../models/patient.js");
const Prescription = require("../models/prescription.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const getPatients = async (req, res) => {
    try {
        let patients = [];
        if (!req.query.name) {
            patients = await Patient.find({}).populate('userId');
        } else {
            const escaped = String(req.query.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchpatient = new RegExp(escaped, 'i');
            patients = await Patient.find().populate({
                path: 'userId',
                select: 'firstName lastName email username',
                match: {
                    $or: [
                        { firstName: { $regex: searchpatient } },
                        { lastName: { $regex: searchpatient } },
                        { email: { $regex: searchpatient } }
                    ]
                }
            });
            patients = patients.filter(patient => patient.userId != null);
        }
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('userId');
        res.json(patient);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const isPatientValid = (newPatient) => {
    let errorList = [];
    if (!newPatient.firstName) errorList.push("Please enter first name");
    if (!newPatient.lastName) errorList.push("Please enter last name");
    if (!newPatient.email) errorList.push("Please enter email");
    if (!newPatient.password) errorList.push("Please enter password");
    if (!newPatient.confirmPassword) errorList.push("Please re-enter password in Confirm Password field");
    if (newPatient.password !== newPatient.confirmPassword) errorList.push("Password and Confirm Password did not match");
    if (!newPatient.phone) errorList.push("Please enter phone");
    return errorList.length > 0 ? { status: false, errors: errorList } : { status: true };
}

const savePatient = async (req, res) => {
    const newPatient = req.body;
    const PatientValidStatus = isPatientValid(newPatient);
    if (!PatientValidStatus.status) {
        return res.status(400).json({ message: 'error', errors: PatientValidStatus.errors });
    }
    try {
        const userDetails = await User.create({
            email: newPatient.email,
            username: newPatient.username,
            firstName: newPatient.firstName,
            lastName: newPatient.lastName,
            password: newPatient.password,
            userType: 'Patient',
            activated: true,
        });
        try {
            await Patient.create({
                userId: userDetails._id,
                phone: newPatient.phone,
                address: newPatient.address,
                gender: newPatient.gender,
                dob: newPatient.dob
            });
            res.status(201).json({ message: 'success' });
        } catch (error2) {
            await User.deleteOne({ _id: userDetails._id });
            res.status(400).json({ message: 'error', errors: [error2.message] });
        }
    } catch (error) {
        res.status(400).json({ message: "error", errors: [error.message] });
    }
}

const updatePatient = async (req, res) => {
    const newPatient = req.body;
    const PatientValidStatus = isPatientValid(newPatient);
    if (!PatientValidStatus.status) {
        return res.status(400).json({ message: 'error', errors: PatientValidStatus.errors });
    }
    try {
        await Patient.updateOne({ _id: req.params.id }, { $set: { phone: req.body.phone, address: req.body.address, gender: req.body.gender, dob: req.body.dob } });

        const userUpdate = { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, username: req.body.username };
        if (req.body.password) {
            userUpdate.password = await bcrypt.hash(req.body.password, 10);
        }
        await User.updateOne({ _id: req.body.userId }, { $set: userUpdate });

        res.status(201).json({ message: 'success' });
    } catch (error) {
        res.status(400).json({ message: 'error', errors: [error.message] });
    }
}

const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id).populate('userId');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        await Patient.deleteOne({ _id: req.params.id });
        await User.deleteOne({ _id: patient.userId._id });
        res.status(200).json({ message: 'success' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getPatientHistory = async (req, res) => {
    try {
        const allPrescriptions = await Prescription.find().populate({
            path: 'prescribedMed.medicineId',
        }).populate({
            path: 'appointmentId',
            match: { patientId: req.params.id },
            populate: [
                { path: 'patientId', populate: { path: 'userId' } },
                { path: 'doctorId', populate: { path: 'userId' } }
            ]
        });
        const prescriptions = allPrescriptions.filter(pre => pre.appointmentId != null);
        res.status(200).json({ message: "success", prescriptions });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getPatients, getPatientById, savePatient, updatePatient, deletePatient, getPatientHistory };
