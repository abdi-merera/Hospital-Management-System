import mongoose from 'mongoose';
import { Admission, Encounter, Patient } from './admission.model';
import { Bed, BedAssignment } from '../wards/ward.model';
import type { AdmissionFilters, AdmissionPayload, AuthSender } from './admission.types';

const populatedAdmissionQuery = [
  {
    path: 'patientId',
    populate: {
      path: 'userId',
    },
  },
  {
    path: 'encounterId',
  },
  {
    path: 'admittedBy',
    select: 'firstName lastName email userType',
  },
  {
    path: 'dischargedBy',
    select: 'firstName lastName email userType',
  },
];

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function buildFilterQuery(filters: AdmissionFilters) {
  const query: Record<string, unknown> = {};

  if (filters.patientId) query.patientId = objectId(filters.patientId);
  if (filters.encounterId) query.encounterId = objectId(filters.encounterId);
  if (filters.status) query.status = filters.status;

  return query;
}

export function listAdmissions(filters: AdmissionFilters) {
  return Admission.find(buildFilterQuery(filters)).populate(populatedAdmissionQuery).sort({ admittedAt: -1 });
}

export function findAdmissionById(id: string) {
  return Admission.findById(id).populate(populatedAdmissionQuery);
}

export async function createAdmissionRecord(payload: AdmissionPayload, sender?: AuthSender) {
  const encounter = await Encounter.findById(payload.encounterId);

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  const patientId = payload.patientId || String(encounter.patientId);
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error('Patient not found');
  }

  const existingOpenAdmission = await Admission.findOne({
    patientId: objectId(patientId),
    status: { $in: ['ADMITTED', 'TRANSFERRED'] },
  });

  if (existingOpenAdmission) {
    throw new Error('Patient already has an active admission');
  }

  return Admission.create({
    patientId: objectId(patientId),
    encounterId: objectId(payload.encounterId as string),
    status: payload.status || 'ADMITTED',
    reason: payload.reason,
    admittedAt: payload.admittedAt ? new Date(payload.admittedAt) : new Date(),
    admittedBy: sender?.id ? objectId(sender.id) : undefined,
  });
}

export function updateAdmissionRecord(id: string, payload: AdmissionPayload) {
  return Admission.findByIdAndUpdate(
    id,
    {
      status: payload.status,
      reason: payload.reason,
      admittedAt: payload.admittedAt ? new Date(payload.admittedAt) : undefined,
      dischargedAt: payload.dischargedAt ? new Date(payload.dischargedAt) : undefined,
      dischargeSummary: payload.dischargeSummary,
    },
    { new: true },
  ).populate(populatedAdmissionQuery);
}

export async function dischargeAdmissionRecord(id: string, payload: AdmissionPayload, sender?: AuthSender) {
  const admissionId = objectId(id);
  const activeAssignment = await BedAssignment.findOne({
    admissionId,
    endedAt: { $exists: false },
  });

  if (activeAssignment) {
    await BedAssignment.findByIdAndUpdate(activeAssignment._id, {
      endedAt: payload.dischargedAt ? new Date(payload.dischargedAt) : new Date(),
      endedBy: sender?.id ? objectId(sender.id) : undefined,
    });
    await Bed.findByIdAndUpdate(activeAssignment.bedId, { status: 'AVAILABLE' });
  }

  return Admission.findByIdAndUpdate(
    id,
    {
      status: 'DISCHARGED',
      dischargedAt: payload.dischargedAt ? new Date(payload.dischargedAt) : new Date(),
      dischargeSummary: payload.dischargeSummary,
      dischargedBy: sender?.id ? objectId(sender.id) : undefined,
    },
    { new: true },
  ).populate(populatedAdmissionQuery);
}
