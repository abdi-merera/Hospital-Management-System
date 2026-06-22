import moment from 'moment';
import mongoose from 'mongoose';
import { Admission, Appointment, AuditLog, Bed, Encounter, Invoice, Patient, Payment, Prescription, User } from './dashboard.model';
import type { AuthSender } from './dashboard.types';

export async function countUsersByRole(userType: string) {
  return User.countDocuments({ userType });
}

export async function countTodayAppointments(sender: AuthSender) {
  const query: Record<string, unknown> = {
    appointmentDate: moment(new Date()).format('YYYY-MM-DD'),
    isTimeSlotAvailable: false,
  };

  if (sender.doctorId) {
    query.doctorId = sender.doctorId;
  }

  if (sender.patientId) {
    query.patientId = sender.patientId;
  }

  const totalAppointments = await Appointment.countDocuments(query);
  const pendingAppointments = await Appointment.countDocuments({
    ...query,
    completed: false,
  });

  return { totalAppointments, pendingAppointments };
}

export async function countPatientsTreatedByDoctor(doctorId: string) {
  const prescriptions = await Prescription.find({}).populate({
    path: 'appointmentId',
    populate: {
      path: 'doctorId',
      match: { _id: new mongoose.Types.ObjectId(doctorId) },
    },
  });

  return prescriptions.filter((prescription: any) => prescription.appointmentId?.doctorId != null).length;
}

function sumField(records: any[], field: string) {
  return records.reduce((total, record) => total + Number(record[field] || 0), 0);
}

export async function getMvpReportSummary() {
  const todayStart = moment().startOf('day').toDate();
  const todayEnd = moment().endOf('day').toDate();

  const [
    totalPatients,
    openEncounters,
    activeAdmissions,
    availableBeds,
    occupiedBeds,
    reservedBeds,
    maintenanceBeds,
    unpaidInvoices,
    paidInvoices,
    cancelledInvoices,
    paymentsToday,
    recentAuditLogs,
  ] = await Promise.all([
    Patient.countDocuments({}),
    Encounter.countDocuments({ status: 'OPEN' }),
    Admission.countDocuments({ status: { $in: ['ADMITTED', 'TRANSFERRED'] } }),
    Bed.countDocuments({ status: 'AVAILABLE' }),
    Bed.countDocuments({ status: 'OCCUPIED' }),
    Bed.countDocuments({ status: 'RESERVED' }),
    Bed.countDocuments({ status: 'MAINTENANCE' }),
    Invoice.find({ status: { $in: ['ISSUED', 'PARTIALLY_PAID'] } }).lean(),
    Invoice.countDocuments({ status: 'PAID' }),
    Invoice.countDocuments({ status: 'CANCELLED' }),
    Payment.find({ receivedAt: { $gte: todayStart, $lte: todayEnd } }).lean(),
    AuditLog.find({})
      .populate({ path: 'userId', select: 'firstName lastName email userType' })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    patients: {
      total: totalPatients,
    },
    encounters: {
      open: openEncounters,
    },
    admissions: {
      active: activeAdmissions,
    },
    beds: {
      available: availableBeds,
      occupied: occupiedBeds,
      reserved: reservedBeds,
      maintenance: maintenanceBeds,
      total: availableBeds + occupiedBeds + reservedBeds + maintenanceBeds,
    },
    billing: {
      unpaidInvoices: unpaidInvoices.length,
      unpaidBalance: sumField(unpaidInvoices, 'balance'),
      paidInvoices,
      cancelledInvoices,
      paymentsToday: paymentsToday.length,
      paymentsReceivedToday: sumField(paymentsToday, 'amount'),
    },
    auditLogs: recentAuditLogs,
  };
}
