export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  doctorId?: string;
  patientId?: string;
}

export interface PrescriptionFilterPayload {
  patientId?: string;
}

export interface PrescribedMedicinePayload {
  medicineId: string;
  dosage?: string;
  qty?: number;
}

export interface PrescriptionPayload {
  appointmentId: string;
  prescribedMed: PrescribedMedicinePayload[];
  remarks?: string;
  paid?: boolean;
}
