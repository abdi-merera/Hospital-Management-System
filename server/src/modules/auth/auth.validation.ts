export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface SignupPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  userType?: 'Admin' | 'Staff' | 'Patient';
}

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin({ email, password }: LoginPayload): ValidationResult {
  const errors: string[] = [];

  if (!email) {
    errors.push('Please enter email');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Please enter password');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateSignup(newUser: SignupPayload): ValidationResult {
  const errors: string[] = [];

  if (!newUser.firstName) {
    errors.push('Please enter first name');
  } else if (!nameRegex.test(newUser.firstName)) {
    errors.push('First name is invalid');
  }

  if (!newUser.lastName) {
    errors.push('Please enter last name');
  } else if (!nameRegex.test(newUser.lastName)) {
    errors.push('Last name is invalid');
  }

  if (!newUser.email) {
    errors.push('Please enter email');
  } else if (!emailRegex.test(newUser.email)) {
    errors.push('Invalid email format');
  }

  if (!newUser.password) {
    errors.push('Please enter password');
  }

  if (!newUser.confirmPassword) {
    errors.push('Please re-enter password in Confirm Password field');
  }

  if (!newUser.userType) {
    errors.push('Please enter User Type');
  }

  if (newUser.userType && !['Admin', 'Staff', 'Patient'].includes(newUser.userType)) {
    errors.push('Invalid User Type');
  }

  if (newUser.password !== newUser.confirmPassword) {
    errors.push('Password and Confirm Password did not match');
  }

  return errors.length > 0 ? { status: false, errors } : { status: true };
}
