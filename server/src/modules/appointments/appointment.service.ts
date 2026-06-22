import mongoose from 'mongoose';
import { Appointment, Doctor, Patient } from './appointment.model';
import type {
  AppointmentQueryPayload,
  AuthSender,
  BookAppointmentPayload,
  CreateAppointmentSlotPayload,
  DeleteAppointmentPayload,
  UpdateAppointmentPayload,
} from './appointment.types';

const populatedAppointmentQuery = [
  {
    path: 'doctorId',
    populate: {
      path: 'userId',
    },
  },
  {
    path: 'patientId',
    populate: {
      path: 'userId',
    },
  },
];

function toAppointmentDate(appDate?: string) {
  return appDate ? new Date(appDate).toISOString().slice(0, 10) : null;
}

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export function listDepartments() {
  return Doctor.distinct('department');
}

export async function listAppointments(payload: AppointmentQueryPayload, sender: AuthSender) {
  const isTimeSlotAvailable = payload.isTimeSlotAvailable;
  const appointmentDate = toAppointmentDate(payload.appDate);
  const doctorId = payload.doctorID;

  if (isTimeSlotAvailable) {
    if (doctorId) {
      return Appointment.find({
        isTimeSlotAvailable,
        appointmentDate,
        doctorId: objectId(doctorId),
      });
    }

    if (sender.doctorId) {
      return Appointment.find({
        isTimeSlotAvailable,
        appointmentDate,
        doctorId: sender.doctorId,
      }).populate(populatedAppointmentQuery);
    }
  }

  if (isTimeSlotAvailable === false) {
    if (sender.userType === 'Admin' || (sender.userType === 'Staff' && !sender.doctorId)) {
      const query: Record<string, unknown> = {
        isTimeSlotAvailable: false,
        appointmentDate,
        completed: false,
      };

      if (doctorId) {
        query.doctorId = objectId(doctorId);
      }

      return Appointment.find(query).populate(populatedAppointmentQuery);
    }

    if (sender.userType === 'Patient') {
      const query: Record<string, unknown> = {
        isTimeSlotAvailable: false,
        completed: false,
        patientId: sender.patientId,
      };

      if (doctorId) {
        query.doctorId = objectId(doctorId);
      }

      if (appointmentDate) {
        query.appointmentDate = appointmentDate;
      }

      return Appointment.find(query).populate(populatedAppointmentQuery);
    }

    if (sender.doctorId) {
      return Appointment.find({
        isTimeSlotAvailable: false,
        completed: false,
        appointmentDate,
        doctorId: sender.doctorId,
      }).populate(populatedAppointmentQuery);
    }
  }

  return [];
}

export async function createSlots(payload: CreateAppointmentSlotPayload, sender?: AuthSender) {
  const appointmentDate = toAppointmentDate(payload.appDate);
  const doctorId = payload.doctorID || sender?.doctorId;

  if (sender?.userType === 'Patient') {
    throw new Error('Patients cannot create appointment slots');
  }

  if (!doctorId) {
    throw new Error('Please choose a doctor');
  }

  const existingAppointments = await Appointment.find({
    appointmentDate,
    appointmentTime: { $in: payload.timeSlots },
    doctorId,
  }).select('appointmentTime');

  if (existingAppointments.length > 0) {
    const takenSlots = existingAppointments.map((appointment: any) => appointment.appointmentTime).join(', ');
    throw new Error(`The selected slot is already taken: ${takenSlots}`);
  }

  for (const slot of payload.timeSlots) {
    await Appointment.create({
      appointmentDate,
      appointmentTime: slot,
      doctorId,
    });
  }
}

export function reserveAppointment(payload: BookAppointmentPayload, sender?: AuthSender) {
  const patientId = sender?.userType === 'Patient' ? sender.patientId : payload.patientId;

  if (!patientId) {
    throw new Error('Please choose a patient');
  }

  return Appointment.findOneAndUpdate(
    {
      isTimeSlotAvailable: true,
      appointmentDate: payload.appDate,
      appointmentTime: payload.appTime,
      doctorId: objectId(payload.doctorId),
    },
    {
      isTimeSlotAvailable: false,
      patientId: objectId(patientId),
    },
  );
}

export function removeAppointment(payload: DeleteAppointmentPayload) {
  return Appointment.findByIdAndDelete(payload.appointmentId);
}

export async function findAppointmentById(id: string) {
  const appointment = await Appointment.findById(id).lean();

  if (!appointment) {
    return null;
  }

  appointment.doctorDetails = await Doctor.findById(appointment.doctorId);
  appointment.patientDetails = await Patient.findById(appointment.patientId);

  return appointment;
}

export async function updateAppointment(id: string, payload: UpdateAppointmentPayload) {
  const appointment = await Appointment.findByIdAndUpdate(id, {
    isTimeSlotAvailable: false,
    appointmentDate: payload.appDate,
    appointmentTime: payload.appTime,
    doctorId: objectId(payload.doctorId),
    patientId: objectId(payload.patientId),
  });

  if (appointment) {
    await Appointment.findOneAndDelete({
      isTimeSlotAvailable: true,
      appointmentDate: payload.appDate,
      appointmentTime: payload.appTime,
    });
  }

  return appointment;
}
