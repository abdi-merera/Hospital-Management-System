const jwt = require("jsonwebtoken");
const adminAuth = require("./adminAuth");
const doctorAuth = require("./doctorAuth");
const patientAuth = require("./patientAuth");
const Patient = require('../../models/patient');
const mongoose = require("mongoose");
const Doctor = require("../../models/doctor");
const User = require("../../models/user");


function userAuth(req, res, next) {
    // console.log("adminAuth hit",);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // console.log("adminAuth ",payload);
        req.sender = {
            "id": payload.id,
            "userType": payload.userType
        };
        if (payload.userType == "Admin") {
            // adminAuth(req,res,next);
        }
        else if (payload.userType == "Staff") {
            const user = await User.findById(payload.id).populate('roles');
            req.sender.roles = (user?.roles || []).map((role) => role.name);
            const hasDoctorRole = user?.roles?.some((role) => role.name === 'Doctor');

            if (hasDoctorRole) {
                // doctorAuth(req,res,next);
                let doctor = await Doctor.findOne({
                    'userId': new mongoose.Types.ObjectId(req.sender.id)
                })
                if (doctor) {
                    req.sender.doctorId = doctor._id;
                }
            }
        }
        else if (payload.userType == "Doctor") {
            // Backward compatibility for old local data created before Staff accounts.
            let doctor = await Doctor.findOne({
                'userId': new mongoose.Types.ObjectId(req.sender.id)
            })
            if (!doctor) return res.status(401).json({ message: 'Unauthorized' });
            req.sender.doctorId = doctor._id;
        }
        else if (payload.userType == "Patient") {
            // patientAuth(req,res,next);
            let patient = await Patient.findOne({
                'userId': new mongoose.Types.ObjectId(req.sender.id)
            })
            // console.log("inside user auth. patient",req.sender.id)
            // console.log("inside user auth. patient",patient)
            if (!patient) return res.status(401).json({ message: 'Unauthorized' });
            req.sender.patientId = patient._id;
        }
        else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    });

}

module.exports = userAuth;
