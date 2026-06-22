import mongoose from 'mongoose';
import { ClinicalNote, Diagnosis, Encounter, Patient } from './emr.model';
import type { AuthSender, ClinicalNotePayload, DiagnosisPayload, EmrFilters } from './emr.types';

const populatedEmrQuery = [
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
    path: 'createdBy',
    select: 'firstName lastName email userType',
  },
  {
    path: 'diagnosedBy',
    select: 'firstName lastName email userType',
  },
];

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function buildFilterQuery(filters: EmrFilters) {
  const query: Record<string, unknown> = {};

  if (filters.encounterId) query.encounterId = objectId(filters.encounterId);
  if (filters.patientId) query.patientId = objectId(filters.patientId);

  return query;
}

async function resolvePatientId(encounterId?: string, patientId?: string) {
  if (patientId) {
    const patient = await Patient.findById(patientId);

    if (!patient) {
      throw new Error('Patient not found');
    }

    return patientId;
  }

  const encounter = await Encounter.findById(encounterId);

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  return String(encounter.patientId);
}

async function requireDoctorReadyEncounter(encounterId?: string) {
  const encounter = await Encounter.findById(encounterId);

  if (!encounter) {
    throw new Error('Encounter not found');
  }

  if (!['READY_FOR_DOCTOR', 'IN_CONSULTATION', 'OPEN'].includes(encounter.status)) {
    throw new Error('This encounter is not ready for doctor consultation. Payment and triage must be completed first.');
  }

  return encounter;
}

export function listClinicalNotes(filters: EmrFilters) {
  return ClinicalNote.find(buildFilterQuery(filters)).populate(populatedEmrQuery).sort({ createdAt: -1 });
}

export function findClinicalNoteById(id: string) {
  return ClinicalNote.findById(id).populate(populatedEmrQuery);
}

export async function createClinicalNoteRecord(payload: ClinicalNotePayload, sender?: AuthSender) {
  const encounter = await requireDoctorReadyEncounter(payload.encounterId);
  const patientId = await resolvePatientId(payload.encounterId, payload.patientId);

  const clinicalNote = await ClinicalNote.create({
    encounterId: objectId(payload.encounterId as string),
    patientId: objectId(patientId),
    noteType: payload.noteType || 'SOAP',
    subjective: payload.subjective,
    objective: payload.objective,
    assessment: payload.assessment,
    plan: payload.plan,
    notes: payload.notes,
    createdBy: sender?.id ? objectId(sender.id) : undefined,
    createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
  });

  if (encounter.status === 'READY_FOR_DOCTOR') {
    await Encounter.findByIdAndUpdate(encounter._id, { status: 'IN_CONSULTATION' });
  }

  return clinicalNote;
}

export function updateClinicalNoteRecord(id: string, payload: ClinicalNotePayload) {
  return ClinicalNote.findByIdAndUpdate(
    id,
    {
      noteType: payload.noteType,
      subjective: payload.subjective,
      objective: payload.objective,
      assessment: payload.assessment,
      plan: payload.plan,
      notes: payload.notes,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : undefined,
    },
    { new: true },
  ).populate(populatedEmrQuery);
}

export function listDiagnoses(filters: EmrFilters) {
  return Diagnosis.find(buildFilterQuery(filters)).populate(populatedEmrQuery).sort({ diagnosedAt: -1 });
}

export function findDiagnosisById(id: string) {
  return Diagnosis.findById(id).populate(populatedEmrQuery);
}

export async function createDiagnosisRecord(payload: DiagnosisPayload, sender?: AuthSender) {
  const encounter = await requireDoctorReadyEncounter(payload.encounterId);
  const patientId = await resolvePatientId(payload.encounterId, payload.patientId);

  const diagnosis = await Diagnosis.create({
    encounterId: objectId(payload.encounterId as string),
    patientId: objectId(patientId),
    code: payload.code,
    description: payload.description,
    diagnosisType: payload.diagnosisType || 'PRIMARY',
    status: payload.status || 'ACTIVE',
    diagnosedBy: sender?.id ? objectId(sender.id) : undefined,
    diagnosedAt: payload.diagnosedAt ? new Date(payload.diagnosedAt) : new Date(),
  });

  if (encounter.status === 'READY_FOR_DOCTOR') {
    await Encounter.findByIdAndUpdate(encounter._id, { status: 'IN_CONSULTATION' });
  }

  return diagnosis;
}

export function updateDiagnosisRecord(id: string, payload: DiagnosisPayload) {
  return Diagnosis.findByIdAndUpdate(
    id,
    {
      code: payload.code,
      description: payload.description,
      diagnosisType: payload.diagnosisType,
      status: payload.status,
      diagnosedAt: payload.diagnosedAt ? new Date(payload.diagnosedAt) : undefined,
    },
    { new: true },
  ).populate(populatedEmrQuery);
}
