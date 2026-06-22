import type { EncounterPayload } from './encounter.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const encounterTypes = ['OUTPATIENT', 'EMERGENCY', 'FOLLOW_UP'];
const encounterStatuses = ['PENDING_PAYMENT', 'WAITING_TRIAGE', 'IN_TRIAGE', 'READY_FOR_DOCTOR', 'IN_CONSULTATION', 'OPEN', 'CLOSED', 'CANCELLED'];

export function validateEncounterPayload(encounter: EncounterPayload): ValidationResult {
  const errors: string[] = [];

  if (!encounter.patientId) errors.push('Please choose a patient');
  if (!encounter.type) errors.push('Please choose encounter type');
  if (encounter.type && !encounterTypes.includes(encounter.type)) errors.push('Invalid encounter type');
  if (encounter.status && !encounterStatuses.includes(encounter.status)) errors.push('Invalid encounter status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateEncounterUpdatePayload(encounter: EncounterPayload): ValidationResult {
  const errors: string[] = [];

  if (encounter.type && !encounterTypes.includes(encounter.type)) errors.push('Invalid encounter type');
  if (encounter.status && !encounterStatuses.includes(encounter.status)) errors.push('Invalid encounter status');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
