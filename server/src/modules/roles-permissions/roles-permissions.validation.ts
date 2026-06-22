import type { PermissionPayload, RolePayload } from './roles-permissions.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

export function validatePermissionPayload(permission: PermissionPayload): ValidationResult {
  const errors: string[] = [];

  if (!permission.code) errors.push('Please enter permission code');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateRolePayload(role: RolePayload): ValidationResult {
  const errors: string[] = [];

  if (!role.name) errors.push('Please enter role name');
  if (role.permissions && !Array.isArray(role.permissions)) errors.push('Permissions must be an array');

  return errors.length > 0 ? { status: false, errors } : { status: true };
}

