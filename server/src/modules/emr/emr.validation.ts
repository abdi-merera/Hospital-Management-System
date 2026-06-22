import type { ClinicalNotePayload, DiagnosisPayload } from './emr.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const clinicalNoteTypes = ['SOAP', 'PROGRESS', 'DISCHARGE', 'GENERAL'];
const diagnosisTypes = ['PRIMARY', 'SECONDARY', 'DIFFERENTIAL'];
const diagnosisStatuses = ['ACTIVE', 'RESOLVED', 'RULED_OUT'];

export function validateClinicalNotePayload(payload: ClinicalNotePayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.encounterId) errors.push('Please choose an encounter');
  if (payload.noteType && !clinicalNoteTypes.includes(payload.noteType)) errors.push('Invalid clinical note type');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateClinicalNoteUpdatePayload(payload: ClinicalNotePayload): ValidationResult {
  const errors: string[] = [];

  if (payload.noteType && !clinicalNoteTypes.includes(payload.noteType)) errors.push('Invalid clinical note type');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateDiagnosisPayload(payload: DiagnosisPayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.encounterId) errors.push('Please choose an encounter');
  if (!payload.description) errors.push('Please enter diagnosis description');
  if (payload.diagnosisType && !diagnosisTypes.includes(payload.diagnosisType)) errors.push('Invalid diagnosis type');
  if (payload.status && !diagnosisStatuses.includes(payload.status)) errors.push('Invalid diagnosis status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateDiagnosisUpdatePayload(payload: DiagnosisPayload): ValidationResult {
  const errors: string[] = [];

  if (payload.diagnosisType && !diagnosisTypes.includes(payload.diagnosisType)) errors.push('Invalid diagnosis type');
  if (payload.status && !diagnosisStatuses.includes(payload.status)) errors.push('Invalid diagnosis status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

