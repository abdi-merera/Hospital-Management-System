import { Doctor, User } from './doctor.model';
import { Role } from '../roles-permissions/roles-permissions.model';
import type { DoctorPayload } from './doctor.validation';

export async function listDoctors(name?: string) {
  const searchDoctor = name ? new RegExp(name, 'i') : null;

  if (!searchDoctor) {
    return Doctor.find({}).populate('userId');
  }

  const doctors = await Doctor.find().populate({
    path: 'userId',
    select: 'firstName lastName email username',
    match: {
      $or: [
        { firstName: { $regex: searchDoctor } },
        { lastName: { $regex: searchDoctor } },
        { email: { $regex: searchDoctor } },
      ],
    },
  });

  return doctors.filter((doctor: any) => doctor.userId != null);
}

export function findDoctorById(id: string) {
  return Doctor.findById(id).populate('userId');
}

export async function createDoctorRecord(payload: DoctorPayload) {
  const doctorRole = await Role.findOne({ name: 'Doctor' });

  const userDetails = await User.create({
    email: payload.email,
    username: payload.username || payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password,
    userType: 'Staff',
    roles: doctorRole ? [doctorRole._id] : [],
    activated: true,
  });

  try {
    await Doctor.create({
      userId: userDetails._id,
      phone: payload.phone,
      department: payload.department,
      address: payload.address,
    });
  } catch (error) {
    await User.deleteOne({ _id: userDetails._id });
    throw error;
  }
}

export async function updateDoctorRecord(id: string, payload: DoctorPayload) {
  await Doctor.updateOne(
    { _id: id },
    {
      $set: {
        phone: payload.phone,
        department: payload.department,
        address: payload.address,
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
}

export async function deleteDoctorRecord(id: string) {
  const doctor = await Doctor.findById(id).populate('userId');

  if (!doctor) {
    return null;
  }

  const deletedDoctor = await Doctor.deleteOne({ _id: id });
  await User.deleteOne({ _id: doctor.userId._id });

  return deletedDoctor;
}
