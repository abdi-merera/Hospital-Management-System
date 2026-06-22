export interface TriagePayload {
  encounterId?: string;
  patientId?: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulse?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  painScore?: number;
  notes?: string;
  recordedAt?: string;
}

export interface TriageFilters {
  encounterId?: string;
  patientId?: string;
}

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  roles?: string[];
}
