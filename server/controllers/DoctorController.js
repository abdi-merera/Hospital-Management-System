const Doctor = require("../models/doctor.js");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");

const getDoctors = async (req, res) => {
    try {
        let doctors = [];
        if (!req.query.name) {
            doctors = await Doctor.find({}).populate('userId');
        } else {
            const escaped = String(req.query.name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchdoctor = new RegExp(escaped, 'i');
            doctors = await Doctor.find().populate({
                path: 'userId',
                select: 'firstName lastName email username',
                match: {
                    $or: [
                        { firstName: { $regex: searchdoctor } },
                        { lastName: { $regex: searchdoctor } },
                        { email: { $regex: searchdoctor } }
                    ]
                }
            });
            doctors = doctors.filter(doctor => doctor.userId != null);
        }
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId');
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

const saveDoctor = async (req, res) => {
    const newdoctor = req.body;
    const doctorValidStatus = isDoctorValid(newdoctor);
    if (!doctorValidStatus.status) {
        return res.status(400).json({ message: 'error', errors: doctorValidStatus.errors });
    }
    try {
        const userDetails = await User.create({
            email: newdoctor.email,
            username: newdoctor.username,
            firstName: newdoctor.firstName,
            lastName: newdoctor.lastName,
            password: newdoctor.password,
            userType: 'Doctor',
            activated: true,
        });
        try {
            await Doctor.create({
                userId: userDetails._id,
                phone: newdoctor.phone,
                department: newdoctor.department,
                address: newdoctor.address
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

const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('userId');
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        await Doctor.deleteOne({ _id: req.params.id });
        await User.deleteOne({ _id: doctor.userId._id });
        res.status(200).json({ message: 'success' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports = { getDoctors, getDoctorById, saveDoctor, updateDoctor, deleteDoctor };
