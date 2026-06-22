export type ClinicalNoteType = 'SOAP' | 'PROGRESS' | 'DISCHARGE' | 'GENERAL';
export type DiagnosisType = 'PRIMARY' | 'SECONDARY' | 'DIFFERENTIAL';
export type DiagnosisStatus = 'ACTIVE' | 'RESOLVED' | 'RULED_OUT';

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  roles?: string[];
}

export interface ClinicalNotePayload {
  encounterId?: string;
  patientId?: string;
  noteType?: ClinicalNoteType;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  notes?: string;
  createdAt?: string;
}

export interface DiagnosisPayload {
  encounterId?: string;
  patientId?: string;
  code?: string;
  description?: string;
  diagnosisType?: DiagnosisType;
  status?: DiagnosisStatus;
  diagnosedAt?: string;
}

export interface EmrFilters {
  encounterId?: string;
  patientId?: string;
}
