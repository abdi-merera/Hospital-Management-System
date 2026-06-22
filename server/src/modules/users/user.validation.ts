export type UserType = 'Admin' | 'Staff' | 'Patient';

export interface UserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  userType?: UserType;
  roleIds?: string[];
}

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validateUserPayload(user: UserPayload): ValidationResult {
  const errors: string[] = [];

  if (!user.firstName) errors.push('Please enter first name');
  if (!user.lastName) errors.push('Please enter last name');
  if (!user.email) errors.push('Please enter email');
  if (!user.password) errors.push('Please enter password');
  if (!user.confirmPassword) errors.push('Please re-enter password in Confirm Password field');
  if (!user.userType) errors.push('Please enter User Type');
  if (user.userType && !['Admin', 'Staff', 'Patient'].includes(user.userType)) errors.push('Invalid User Type');
  if (user.roleIds && !Array.isArray(user.roleIds)) errors.push('Roles must be a list');
  if (user.password !== user.confirmPassword) errors.push('Password and Confirm Password did not match');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
