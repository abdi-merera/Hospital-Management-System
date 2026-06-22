export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
}

export interface WardPayload {
  name?: string;
  departmentId?: string;
  description?: string;
}

export interface RoomPayload {
  wardId?: string;
  roomNo?: string;
  description?: string;
}

export interface BedPayload {
  roomId?: string;
  bedNo?: string;
  status?: BedStatus;
  description?: string;
}

export interface BedAssignmentPayload {
  admissionId?: string;
  bedId?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface WardFilters {
  wardId?: string;
  roomId?: string;
  admissionId?: string;
  bedId?: string;
  status?: BedStatus;
}
