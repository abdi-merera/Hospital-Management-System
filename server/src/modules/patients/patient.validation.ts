export interface PatientPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  region?: string;
  city?: string;
  woreda?: string;
  age?: number | string;
  gender?: string;
  dob?: string;
  userId?: string;
  medicalRecordNo?: string;
}

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validatePatientPayload(patient: PatientPayload): ValidationResult {
  const errors: string[] = [];

  if (!patient.firstName) errors.push('Please enter first name');
  if (!patient.lastName) errors.push('Please enter last name');
  if (!patient.email) errors.push('Please enter email');
  if (!patient.password) errors.push('Please enter password');
  if (!patient.confirmPassword) errors.push('Please re-enter password in Confirm Password field');
  if (patient.password !== patient.confirmPassword) errors.push('Password and Confirm Password did not match');
  if (!patient.phone) errors.push('Please enter phone');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
