import type { PrescriptionPayload } from './prescription.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validatePrescriptionPayload(prescription: PrescriptionPayload): ValidationResult {
  const errors: string[] = [];

  if (!prescription.appointmentId) {
    errors.push('Please provide appointment');
  }

  if (!Array.isArray(prescription.prescribedMed) || prescription.prescribedMed.length === 0) {
    errors.push('Please provide prescribed medicine');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
