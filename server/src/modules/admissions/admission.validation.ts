import type { AdmissionPayload } from './admission.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const admissionStatuses = ['ADMITTED', 'TRANSFERRED', 'DISCHARGED', 'CANCELLED'];

export function validateAdmissionPayload(payload: AdmissionPayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.encounterId) errors.push('Please choose an encounter');
  if (payload.status && !admissionStatuses.includes(payload.status)) errors.push('Invalid admission status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateAdmissionUpdatePayload(payload: AdmissionPayload): ValidationResult {
  const errors: string[] = [];

  if (payload.status && !admissionStatuses.includes(payload.status)) errors.push('Invalid admission status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

