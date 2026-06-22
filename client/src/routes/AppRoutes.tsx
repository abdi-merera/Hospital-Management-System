import React, { ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';

import LoginPage from '../components/Login/Login';
import SignupPage from '../components/SignUp/SignupPage';
import Dashboard from '../components/dashboard/Dashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AddUser from '../components/User/AddUser3';
import UserList from '../components/User/UserList3';
import EditUser from '../components/User/EditUser3';
import User from '../components/User/User';
import AddPatient from '../components/Patient/AddPatient';
import PatientList from '../components/Patient/PatientList';
import EditPatient from '../components/Patient/EditPatient';
import Patient from '../components/Patient/Patient';
import AddDoctor from '../components/Doctor/AddDoctor';
import DoctorList from '../components/Doctor/DoctorList';
import EditDoctor from '../components/Doctor/EditDoctor';
import Doctor from '../components/Doctor/Doctor';
import AddMedicine from '../components/Medicine/AddMedicine';
import MedicineList from '../components/Medicine/MedicineList';
import EditMedicine from '../components/Medicine/EditMedicine';
import Medicine from '../components/Medicine/Medicine';
import PrescriptionList from '../components/Prescription/PrescriptionList';
import Prescription from '../components/Prescription/Prescription';
import Success from '../components/Prescription/Success';
import Cancel from '../components/Prescription/Cancel';
import PatientDashboard from '../components/dashboard/PatientDashboard';
import DoctorDashboard from '../components/dashboard/DoctorDashboard';
import ReceptionistDashboard from '../components/dashboard/ReceptionistDashboard';
import AdminAppointment from '../components/Appointment/AdminAppointment';
import PatientAppointment from '../components/Appointment/PatientAppointment';
import DoctorAppointment from '../components/Appointment/DoctorAppointment';
import DoctorProfile from '../components/Profile/DoctorProfile';
import PatientProfile from '../components/Profile/PatientProfile';
import AdminProfile from '../components/Profile/AdminProfile';
import StaffProfile from '../components/Profile/StaffProfile';
import PatientHistory from '../components/Patient/PatientHistory';
import EncounterList from '../components/Encounters/EncounterList';
import WardManagement from '../components/Wards/WardManagement';
import BillingManagement from '../components/Billing/BillingManagement';
import AuditLogManagement from '../components/AuditLogs/AuditLogManagement';
import RolesPermissionsManagement from '../components/RolesPermissions/RolesPermissionsManagement';
import ReportsDashboard from '../components/Reports/ReportsDashboard';
import { useUserContext } from '../hooks/useUserContext';

const NotFound = () => <h2 style={{ margin: '70px' }}>This Path is not available</h2>;

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useUserContext() as any;
  return currentUser.userType === 'Admin' ? <>{children}</> : null;
}

function ProtectedStaffRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useUserContext() as any;
  return currentUser.userType === 'Admin' || currentUser.userType === 'Staff' ? <>{children}</> : null;
}

function ProtectedRoleRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { currentUser } = useUserContext() as any;

  if (currentUser.userType === 'Admin') return <>{children}</>;
  if (currentUser.userType !== 'Staff') return null;
  return roles.some((role) => hasRole(currentUser, role)) ? <>{children}</> : null;
}

function ProtectedPermissionRoute({ children, permissions }: { children: ReactNode; permissions: string[] }) {
  const { currentUser } = useUserContext() as any;

  if (currentUser.userType === 'Admin') return <>{children}</>;
  return permissions.some((permission) => (currentUser.permissions || []).includes(permission)) ? <>{children}</> : null;
}

function ProtectedPatientRoute({ children }: { children: ReactNode }) {
  const { currentUser } = useUserContext() as any;
  return currentUser.userType === 'Patient' ? <>{children}</> : null;
}

function hasRole(currentUser: any, roleName: string) {
  return (currentUser.roles || []).some((role: any) => (typeof role === 'string' ? role : role.name) === roleName);
}

export default function AppRoutes() {
  const { currentUser } = useUserContext() as any;

  return (
    <Routes>
      <Route path="/" element={<Dashboard />}>
        <Route
          index
          element={
            currentUser.userType === 'Admin' ? (
              <AdminDashboard />
            ) : currentUser.userType === 'Staff' && hasRole(currentUser, 'Doctor') ? (
              <DoctorDashboard />
            ) : currentUser.userType === 'Staff' ? (
              <ReceptionistDashboard />
            ) : currentUser.userType === 'Patient' ? (
              <PatientDashboard />
            ) : (
              <div />
            )
          }
        />

        <Route path="users" element={<ProtectedAdminRoute><User /></ProtectedAdminRoute>}>
          <Route index element={<UserList />} />
          <Route path="add" element={<AddUser />} />
          <Route path="edit/:id" element={<EditUser />} />
        </Route>

        <Route path="patients" element={<ProtectedPermissionRoute permissions={['view_patient', 'create_patient', 'update_patient']}><Patient /></ProtectedPermissionRoute>}>
          <Route index element={<ProtectedPermissionRoute permissions={['view_patient']}><PatientList /></ProtectedPermissionRoute>} />
          <Route path="add" element={<ProtectedPermissionRoute permissions={['create_patient']}><AddPatient /></ProtectedPermissionRoute>} />
          <Route path="edit/:id" element={<ProtectedPermissionRoute permissions={['update_patient']}><EditPatient /></ProtectedPermissionRoute>} />
        </Route>

        <Route path="doctors" element={<ProtectedAdminRoute><Doctor /></ProtectedAdminRoute>}>
          <Route index element={<DoctorList />} />
          <Route path="add" element={<AddDoctor />} />
          <Route path="edit/:id" element={<EditDoctor />} />
        </Route>

        <Route path="medicines" element={<Medicine />}>
          <Route index element={<ProtectedRoleRoute roles={['Doctor', 'Pharmacist']}><MedicineList /></ProtectedRoleRoute>} />
          <Route path="add" element={<ProtectedAdminRoute><AddMedicine /></ProtectedAdminRoute>} />
          <Route path="edit/:id" element={<ProtectedAdminRoute><EditMedicine /></ProtectedAdminRoute>} />
        </Route>

        <Route path="prescriptions" element={<Prescription />}>
          <Route index element={currentUser.userType === 'Patient' ? <PrescriptionList /> : <ProtectedRoleRoute roles={['Doctor']}><PrescriptionList /></ProtectedRoleRoute>} />
          <Route path="success" element={<Success />} />
          <Route path="cancel" element={<Cancel />} />
        </Route>

        <Route path="patient/history/:id" element={<ProtectedStaffRoute><PatientHistory /></ProtectedStaffRoute>} />
        <Route path="medical-history" element={<ProtectedPatientRoute><PatientDashboard /></ProtectedPatientRoute>} />
        <Route path="encounters" element={<ProtectedPermissionRoute permissions={['view_encounter', 'create_encounter']}><EncounterList /></ProtectedPermissionRoute>} />
        <Route path="wards" element={<ProtectedAdminRoute><WardManagement /></ProtectedAdminRoute>} />
        <Route path="billing" element={<ProtectedPermissionRoute permissions={['view_invoice', 'receive_payment']}><BillingManagement /></ProtectedPermissionRoute>} />
        <Route path="audit-logs" element={<ProtectedAdminRoute><AuditLogManagement /></ProtectedAdminRoute>} />
        <Route path="roles-permissions" element={<ProtectedAdminRoute><RolesPermissionsManagement /></ProtectedAdminRoute>} />
        <Route path="reports" element={<ProtectedAdminRoute><ReportsDashboard /></ProtectedAdminRoute>} />

        <Route
          path="appointments"
          element={
            currentUser.userType === 'Admin' ? (
              <AdminAppointment />
            ) : currentUser.userType === 'Staff' && hasRole(currentUser, 'Doctor') ? (
              <DoctorAppointment />
            ) : currentUser.userType === 'Staff' ? (
              <AdminAppointment />
            ) : currentUser.userType === 'Patient' ? (
              <PatientAppointment />
            ) : (
              <div />
            )
          }
        />

        <Route
          path="profile"
          element={
            currentUser.userType === 'Admin' ? (
              <AdminProfile />
            ) : currentUser.userType === 'Staff' && hasRole(currentUser, 'Doctor') ? (
              <DoctorProfile />
            ) : currentUser.userType === 'Staff' ? (
              <StaffProfile />
            ) : currentUser.userType === 'Patient' ? (
              <PatientProfile />
            ) : (
              <div />
            )
          }
        />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/*" element={<NotFound />} />
    </Routes>
  );
}
