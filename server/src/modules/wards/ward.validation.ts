import type { BedAssignmentPayload, BedPayload, RoomPayload, WardPayload } from './ward.types';

export interface ValidationResult {
  status: boolean;
  errors?: string[];
}

const bedStatuses = ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'];

export function validateWardPayload(payload: WardPayload): ValidationResult {
  const errors: string[] = [];
  if (!payload.name) errors.push('Please enter ward name');
  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateRoomPayload(payload: RoomPayload): ValidationResult {
  const errors: string[] = [];
  if (!payload.wardId) errors.push('Please choose a ward');
  if (!payload.roomNo) errors.push('Please enter room number');
  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateBedPayload(payload: BedPayload): ValidationResult {
  const errors: string[] = [];
  if (!payload.roomId) errors.push('Please choose a room');
  if (!payload.bedNo) errors.push('Please enter bed number');
  if (payload.status && !bedStatuses.includes(payload.status)) errors.push('Invalid bed status');
  return errors.length > 0 ? { status: false, errors } : { status: true };
}

export function validateBedAssignmentPayload(payload: BedAssignmentPayload): ValidationResult {
  const errors: string[] = [];
  if (!payload.admissionId) errors.push('Please choose an admission');
  if (!payload.bedId) errors.push('Please choose a bed');
  return errors.length > 0 ? { status: false, errors } : { status: true };
}

