export interface DoctorPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  department?: string;
  address?: string;
  userId?: string;
}

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validateDoctorPayload(doctor: DoctorPayload): ValidationResult {
  const errors: string[] = [];

  if (!doctor.firstName) errors.push('Please enter first name');
  if (!doctor.lastName) errors.push('Please enter last name');
  if (!doctor.email) errors.push('Please enter email');
  if (!doctor.password) errors.push('Please enter password');
  if (!doctor.confirmPassword) errors.push('Please re-enter password in Confirm Password field');
  if (doctor.password !== doctor.confirmPassword) errors.push('Password and Confirm Password did not match');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
