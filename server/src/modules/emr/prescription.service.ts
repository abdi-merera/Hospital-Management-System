import { Appointment, Prescription } from './prescription.model';
import type { AuthSender, PrescriptionFilterPayload, PrescriptionPayload } from './prescription.types';

const appointmentPopulate = {
  path: 'appointmentId',
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
};

function buildAppointmentMatch(payload: PrescriptionFilterPayload, sender: AuthSender) {
  if (sender.userType === 'Patient') {
    return { patientId: sender.patientId };
  }

  let matchDoctorPatient: Record<string, unknown> = {};
  const searchPatient = payload.patientId;
  const searchDoctor = sender.doctorId;

  if (searchPatient) {
    matchDoctorPatient = { patientId: searchPatient };
  }

  if (searchDoctor) {
    matchDoctorPatient = { doctorId: searchDoctor };
  }

  if (searchPatient && searchDoctor) {
    matchDoctorPatient = { patientId: searchPatient, doctorId: searchDoctor };
  }

  return matchDoctorPatient;
}

export async function listPrescriptions(payload: PrescriptionFilterPayload, sender: AuthSender) {
  const appointmentMatch = buildAppointmentMatch(payload, sender);

  const prescriptions = await Prescription.find({})
    .populate({
      path: 'prescribedMed.medicineId',
    })
    .populate({
      ...appointmentPopulate,
      match: appointmentMatch,
    });

  return prescriptions.filter((prescription: any) => prescription.appointmentId != null);
}

export async function createPrescriptionRecord(payload: PrescriptionPayload) {
  await Prescription.create(payload);
  await Appointment.findByIdAndUpdate(payload.appointmentId, { completed: true });
}
