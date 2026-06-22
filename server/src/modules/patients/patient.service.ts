import Patient from './patient.model';
import type { PatientPayload } from './patient.validation';
import { Role } from '../roles-permissions/roles-permissions.model';

const Prescription = require('../../../models/prescription');
const User = require('../../../models/user');

async function generateMedicalRecordNo() {
  const year = new Date().getFullYear();
  const count = await Patient.countDocuments();
  let nextNumber = count + 1;
  let medicalRecordNo = `MRN-${year}-${String(nextNumber).padStart(5, '0')}`;

  while (await Patient.exists({ medicalRecordNo })) {
    nextNumber += 1;
    medicalRecordNo = `MRN-${year}-${String(nextNumber).padStart(5, '0')}`;
  }

  return medicalRecordNo;
}

function buildAddress(payload: PatientPayload) {
  const addressParts = [payload.region, payload.city, payload.woreda]
    .map((part) => part?.trim())
    .filter(Boolean);

  return addressParts.length > 0 ? addressParts.join(', ') : payload.address;
}

export async function listPatients(search?: string) {
  const searchPatient = search ? new RegExp(search, 'i') : null;

  if (!searchPatient) {
    return Patient.find({}).populate('userId');
  }

  const patients = await Patient.find({
    $or: [
      { phone: { $regex: searchPatient } },
      { medicalRecordNo: { $regex: searchPatient } },
    ],
  }).populate('userId');

  const patientsByUser = await Patient.find().populate({
    path: 'userId',
    select: 'firstName lastName email username',
    match: {
      $or: [
        { firstName: { $regex: searchPatient } },
        { lastName: { $regex: searchPatient } },
        { email: { $regex: searchPatient } },
      ],
    },
  });

  const matches = [
    ...patients,
    ...patientsByUser.filter((patient: any) => patient.userId != null),
  ];

  return [...new Map(matches.map((patient: any) => [String(patient._id), patient])).values()];
}

export function findPatientById(id: string) {
  return Patient.findById(id).populate('userId');
}

export async function createPatientRecord(payload: PatientPayload) {
  const patientRole = await Role.findOne({ name: 'Patient' });

  const userDetails = await User.create({
    email: payload.email,
    username: payload.username || payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password,
    userType: 'Patient',
    roles: patientRole ? [patientRole._id] : [],
    activated: true,
  });

  try {
    return await Patient.create({
      medicalRecordNo: payload.medicalRecordNo || await generateMedicalRecordNo(),
      userId: userDetails._id,
      phone: payload.phone,
      address: buildAddress(payload),
      region: payload.region,
      city: payload.city,
      woreda: payload.woreda,
      age: payload.age,
      gender: payload.gender,
    });
  } catch (error) {
    await User.deleteOne({ _id: userDetails._id });
    throw error;
  }
}

export async function updatePatientRecord(id: string, payload: PatientPayload) {
  await Patient.updateOne(
    { _id: id },
    {
      $set: {
        phone: payload.phone,
        address: buildAddress(payload),
        region: payload.region,
        city: payload.city,
        woreda: payload.woreda,
        age: payload.age,
        gender: payload.gender,
      },
    },
  );

  await User.updateOne(
    { _id: payload.userId },
    {
      $set: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        username: payload.username || payload.email,
        password: payload.password,
      },
    },
  );

  return Patient.findById(id).populate('userId');
}

export async function deletePatientRecord(id: string) {
  const patient = await Patient.findById(id).populate('userId');

  if (!patient) {
    return null;
  }

  const deletedPatient = await Patient.deleteOne({ _id: id });
  await User.deleteOne({ _id: patient.userId._id });

  return deletedPatient;
}

export async function findPatientHistory(patientId: string) {
  return Prescription.find()
    .populate({
      path: 'prescribedMed.medicineId',
    })
    .populate({
      path: 'appointmentId',
      match: { patientId },
      populate: [
        {
          path: 'patientId',
          populate: {
            path: 'userId',
          },
        },
        {
          path: 'doctorId',
          populate: {
            path: 'userId',
          },
        },
      ],
    })
    .then((prescriptions: any[]) => prescriptions.filter((prescription) => prescription.appointmentId != null));
}
