import mongoose from 'mongoose';
import { Appointment, Encounter, Patient } from './encounter.model';
import type { AuthSender, EncounterFilters, EncounterPayload } from './encounter.types';
import { Invoice, InvoiceItem } from '../billing/invoice.model';

const populatedEncounterQuery = [
  {
    path: 'patientId',
    populate: {
      path: 'userId',
    },
  },
  {
    path: 'appointmentId',
    populate: [
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
    ],
  },
  {
    path: 'createdBy',
    select: 'firstName lastName email userType',
  },
];

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function consultationFee(type?: string) {
  if (type === 'EMERGENCY') return 300;
  if (type === 'FOLLOW_UP') return 100;
  return 200;
}

export async function listEncounters(filters: EncounterFilters, sender?: AuthSender) {
  const query: Record<string, unknown> = {};
  const roles = sender?.roles || [];
  const allowedStatuses = sender?.userType === 'Staff' && roles.includes('Nurse')
    ? ['WAITING_TRIAGE', 'IN_TRIAGE']
    : sender?.userType === 'Staff' && roles.includes('Doctor')
      ? ['READY_FOR_DOCTOR', 'IN_CONSULTATION', 'OPEN']
      : null;

  if (filters.patientId) query.patientId = objectId(filters.patientId);
  if (filters.appointmentId) query.appointmentId = objectId(filters.appointmentId);
  if (filters.type) query.type = filters.type;
  if (filters.status) {
    query.status = allowedStatuses && !allowedStatuses.includes(filters.status) ? { $in: [] } : filters.status;
  } else if (allowedStatuses) {
    query.status = { $in: allowedStatuses };
  }

  return Encounter.find(query).populate(populatedEncounterQuery).sort({ startedAt: -1 });
}

export function findEncounterById(id: string) {
  return Encounter.findById(id).populate(populatedEncounterQuery);
}

export async function createEncounterRecord(payload: EncounterPayload, sender?: AuthSender) {
  const patient = await Patient.findById(payload.patientId);

  if (!patient) {
    throw new Error('Patient not found');
  }

  if (payload.appointmentId) {
    const appointment = await Appointment.findById(payload.appointmentId);

    if (!appointment) {
      throw new Error('Appointment not found');
    }
  }

  const encounter = await Encounter.create({
    patientId: objectId(payload.patientId as string),
    appointmentId: payload.appointmentId ? objectId(payload.appointmentId) : undefined,
    type: payload.type,
    status: 'PENDING_PAYMENT',
    reason: payload.reason,
    startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
    createdBy: sender?.id ? objectId(sender.id) : undefined,
  });

  const unitPrice = consultationFee(payload.type);
  const invoice = await Invoice.create({
    patientId: objectId(payload.patientId as string),
    encounterId: encounter._id,
    status: 'ISSUED',
    subtotal: unitPrice,
    total: unitPrice,
    paid: 0,
    balance: unitPrice,
    createdBy: sender?.id ? objectId(sender.id) : undefined,
  });

  await InvoiceItem.create({
    invoiceId: invoice._id,
    description: `${payload.type === 'EMERGENCY' ? 'Emergency' : payload.type === 'FOLLOW_UP' ? 'Follow-up' : 'Outpatient'} consultation fee`,
    quantity: 1,
    unitPrice,
    total: unitPrice,
    category: 'CONSULTATION',
  });

  return encounter.populate(populatedEncounterQuery);
}

export async function updateEncounterRecord(id: string, payload: EncounterPayload) {
  const update: Record<string, unknown> = {};

  if (payload.patientId) update.patientId = objectId(payload.patientId);
  if (payload.appointmentId) update.appointmentId = objectId(payload.appointmentId);
  if (payload.type) update.type = payload.type;
  if (payload.status) update.status = payload.status;
  if (payload.reason !== undefined) update.reason = payload.reason;
  if (payload.startedAt) update.startedAt = new Date(payload.startedAt);
  if (payload.endedAt) update.endedAt = new Date(payload.endedAt);

  return Encounter.findByIdAndUpdate(id, update, { new: true }).populate(populatedEncounterQuery);
}

export function closeEncounterRecord(id: string) {
  return Encounter.findByIdAndUpdate(
    id,
    {
      status: 'CLOSED',
      endedAt: new Date(),
    },
    { new: true },
  ).populate(populatedEncounterQuery);
}
