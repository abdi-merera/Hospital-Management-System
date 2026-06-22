export type EncounterType = 'OUTPATIENT' | 'EMERGENCY' | 'FOLLOW_UP';
export type EncounterStatus = 'PENDING_PAYMENT' | 'WAITING_TRIAGE' | 'IN_TRIAGE' | 'READY_FOR_DOCTOR' | 'IN_CONSULTATION' | 'OPEN' | 'CLOSED' | 'CANCELLED';

export interface EncounterPayload {
  patientId?: string;
  appointmentId?: string;
  type?: EncounterType;
  status?: EncounterStatus;
  reason?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface EncounterFilters {
  patientId?: string;
  appointmentId?: string;
  type?: EncounterType;
  status?: EncounterStatus;
}

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  roles?: string[];
}
