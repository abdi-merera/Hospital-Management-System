export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
  doctorId?: string;
  patientId?: string;
}

export interface AppointmentQueryPayload {
  isTimeSlotAvailable?: boolean;
  appDate?: string;
  doctorID?: string;
}

export interface CreateAppointmentSlotPayload {
  appDate: string;
  timeSlots: string[];
  doctorID?: string;
}

export interface BookAppointmentPayload {
  appDate: string;
  appTime: string;
  doctorId: string;
  patientId: string;
}

export interface DeleteAppointmentPayload {
  appointmentId: string;
}

export interface UpdateAppointmentPayload {
  appDate: string;
  appTime: string;
  doctorId: string;
  patientId: string;
}
