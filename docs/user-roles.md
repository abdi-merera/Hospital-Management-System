# User Roles And Permissions

The HMIS should use role-based access control rather than hard-coded role checks spread across the app.

## Initial Roles

```txt
Super Admin
Hospital Admin
Receptionist
Doctor
Nurse
Laboratory Staff
Radiology Staff
Pharmacist
Cashier
Insurance Officer
Manager / Report Viewer
```

## Initial Permissions

```txt
manage_users
manage_roles
manage_departments
create_patient
view_patient
update_patient
create_appointment
view_appointment
create_encounter
view_encounter
create_triage
view_emr
create_clinical_note
create_diagnosis
create_admission
assign_bed
create_invoice
receive_payment
view_reports
view_audit_logs
```

## MVP Access Direction

- Admin users can manage staff, departments, patients, appointments, and billing setup.
- Receptionists can register patients, schedule appointments, and create walk-in encounters.
- Doctors can view assigned patients, encounters, clinical notes, diagnoses, and prescriptions.
- Nurses can record triage and nursing notes.
- Cashiers can create invoices and receive payments.
- Managers can view reports.
- Super Admin can manage roles, permissions, and audit logs.

