const User = require("../models/user.js");
const Patient = require("../models/patient.js");
const Doctor = require("../models/doctor.js");
const bcrypt = require("bcrypt");

const getAdminByUserId = async (req, res) => {
    try {
        const admin = await User.findOne({ _id: req.params.id });
        res.json(admin);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const isAdminValid = (newUser) => {
    let errorList = [];
    if (!newUser.firstName) errorList.push("Please enter first name");
    if (!newUser.lastName) errorList.push("Please enter last name");
    if (!newUser.email) errorList.push("Please enter email");
    if (!newUser.password) errorList.push("Please enter password");
    if (!newUser.confirmPassword) errorList.push("Please re-enter password in Confirm Password field");
    if (newUser.password !== newUser.confirmPassword) errorList.push("Password and Confirm Password did not match");
    return errorList.length > 0 ? { status: false, errors: errorList } : { status: true };
}

const updateAdmin = async (req, res) => {
    const newUser = req.body;
    const userValidStatus = isAdminValid(newUser);
    if (!userValidStatus.status) {
        return res.status(400).json({ message: 'error', errors: userValidStatus.errors });
    }
    try {
        const update = { firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email, username: newUser.username };
        if (newUser.password) {
            update.password = await bcrypt.hash(newUser.password, 10);
        }
        await User.updateOne({ _id: req.params.id }, { $set: update });
        res.status(201).json({ message: 'success' });
    } catch (error) {
        res.status(400).json({ message: 'error', errors: [error.message] });
    }
}

const getDoctorByUserId = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.params.id }).populate('userId');
        res.json(doctor);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const isDoctorValid = (newdoctor) => {
    let errorList = [];
    if (!newdoctor.firstName) errorList.push("Please enter first name");
    if (!newdoctor.lastName) errorList.push("Please enter last name");
    if (!newdoctor.email) errorList.push("Please enter email");
    if (!newdoctor.password) errorList.push("Please enter password");
    if (!newdoctor.confirmPassword) errorList.push("Please re-enter password in Confirm Password field");
    if (newdoctor.password !== newdoctor.confirmPassword) errorList.push("Password and Confirm Password did not match");
    return errorList.length > 0 ? { status: false, errors: errorList } : { status: true };
}

const updateDoctor = async (req, res) => {
    const newdoctor = req.body;
    const doctorValidStatus = isDoctorValid(newdoctor);
    if (!doctorValidStatus.status) {
        return res.status(400).json({ message: 'error', errors: doctorValidStatus.errors });
    }
    try {
        await Doctor.updateOne({ _id: req.params.id }, { $set: { phone: req.body.phone, department: req.body.department } });

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

const getPatientByUserId = async (req, res) => {
    try {
        const patient = await Patient.findOne({ userId: req.params.id }).populate('userId');
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

module.exports = { getAdminByUserId, updateAdmin, getDoctorByUserId, updateDoctor, getPatientByUserId, updatePatient };
