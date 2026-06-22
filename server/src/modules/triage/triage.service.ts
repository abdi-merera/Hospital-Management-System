import mongoose from 'mongoose';
import { Encounter, Patient, TriageRecord } from './triage.model';
import type { AuthSender, TriageFilters, TriagePayload } from './triage.types';

const populatedTriageQuery = [
  {
    path: 'encounterId',
  },
  {
    path: 'patientId',
    populate: {
      path: 'userId',
    },
  },
  {
    path: 'recordedBy',
    select: 'firstName lastName email userType',
  },
];

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function numericOrUndefined(value: unknown) {
  return value === undefined || value === null || value === '' ? undefined : Number(value);
}

function buildTriageUpdate(payload: TriagePayload) {
  const update: Record<string, unknown> = {};

  if (payload.temperature !== undefined) update.temperature = numericOrUndefined(payload.temperature);
  if (payload.bloodPressureSystolic !== undefined) update.bloodPressureSystolic = numericOrUndefined(payload.bloodPressureSystolic);
  if (payload.bloodPressureDiastolic !== undefined) update.bloodPressureDiastolic = numericOrUndefined(payload.bloodPressureDiastolic);
  if (payload.pulse !== undefined) update.pulse = numericOrUndefined(payload.pulse);
  if (payload.respiratoryRate !== undefined) update.respiratoryRate = numericOrUndefined(payload.respiratoryRate);
  if (payload.oxygenSaturation !== undefined) update.oxygenSaturation = numericOrUndefined(payload.oxygenSaturation);
  if (payload.weight !== undefined) update.weight = numericOrUndefined(payload.weight);
  if (payload.height !== undefined) update.height = numericOrUndefined(payload.height);
  if (payload.painScore !== undefined) update.painScore = numericOrUndefined(payload.painScore);
  if (payload.notes !== undefined) update.notes = payload.notes;
  if (payload.recordedAt) update.recordedAt = new Date(payload.recordedAt);

  return update;
}

export async function listTriageRecords(filters: TriageFilters) {
  const query: Record<string, unknown> = {};

  if (filters.encounterId) query.encounterId = objectId(filters.encounterId);
  if (filters.patientId) query.patientId = objectId(filters.patientId);

  return TriageRecord.find(query).populate(populatedTriageQuery).sort({ recordedAt: -1 });
}

export function findTriageRecordById(id: string) {
  return TriageRecord.findById(id).populate(populatedTriageQuery);
}

export function findTriageRecordsByEncounter(encounterId: string) {
  return TriageRecord.find({ encounterId: objectId(encounterId) }).populate(populatedTriageQuery).sort({ recordedAt: -1 });
}

export async function createTriageRecord(payload: TriagePayload, sender?: AuthSender) {
  const encounter = await Encounter.findById(payload.encounterId);

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  if (!['WAITING_TRIAGE', 'IN_TRIAGE'].includes(encounter.status)) {
    throw new Error('This encounter is not ready for triage. Payment must be completed first.');
  }

  const patientId = payload.patientId || String(encounter.patientId);
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error('Patient not found');
  }

  const triageRecord = await TriageRecord.create({
    encounterId: objectId(payload.encounterId as string),
    patientId: objectId(patientId),
    ...buildTriageUpdate(payload),
    recordedBy: sender?.id ? objectId(sender.id) : undefined,
    recordedAt: payload.recordedAt ? new Date(payload.recordedAt) : new Date(),
  });

  await Encounter.findByIdAndUpdate(encounter._id, { status: 'READY_FOR_DOCTOR' });

  return triageRecord;
}

export function updateTriageRecord(id: string, payload: TriagePayload) {
  return TriageRecord.findByIdAndUpdate(id, buildTriageUpdate(payload), { new: true }).populate(populatedTriageQuery);
}
