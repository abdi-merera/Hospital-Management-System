export type AdmissionStatus = 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED' | 'CANCELLED';

export interface AdmissionPayload {
  patientId?: string;
  encounterId?: string;
  status?: AdmissionStatus;
  reason?: string;
  admittedAt?: string;
  dischargedAt?: string;
  dischargeSummary?: string;
}

export interface AdmissionFilters {
  patientId?: string;
  encounterId?: string;
  status?: AdmissionStatus;
}

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
}
