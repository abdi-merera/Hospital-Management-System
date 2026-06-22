import type { TriagePayload } from './triage.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

function isNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function validateTriagePayload(payload: TriagePayload): ValidationResult {
  const errors: string[] = [];

  if (!payload.encounterId) errors.push('Please choose an encounter');

  if (payload.painScore !== undefined && (!isNumber(payload.painScore) || payload.painScore < 0 || payload.painScore > 10)) {
    errors.push('Pain score must be between 0 and 10');
  }

  if (payload.oxygenSaturation !== undefined && (!isNumber(payload.oxygenSaturation) || payload.oxygenSaturation < 0 || payload.oxygenSaturation > 100)) {
    errors.push('Oxygen saturation must be between 0 and 100');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateTriageUpdatePayload(payload: TriagePayload): ValidationResult {
  const errors: string[] = [];

  if (payload.painScore !== undefined && (!isNumber(payload.painScore) || payload.painScore < 0 || payload.painScore > 10)) {
    errors.push('Pain score must be between 0 and 10');
  }

  if (payload.oxygenSaturation !== undefined && (!isNumber(payload.oxygenSaturation) || payload.oxygenSaturation < 0 || payload.oxygenSaturation > 100)) {
    errors.push('Oxygen saturation must be between 0 and 100');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

