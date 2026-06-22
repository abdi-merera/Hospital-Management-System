export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  doctorId?: string;
  patientId?: string;
}
