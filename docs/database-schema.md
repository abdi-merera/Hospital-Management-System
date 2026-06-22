# Database Schema Direction

This document defines the first-pass MongoDB collection direction for the HMIS.

## Core Administration

```txt
users
roles
permissions
role_permissions
staff
departments
```

## Patient And Visit

```txt
patients
appointments
encounters
triage_records
clinical_notes
diagnoses
```

## Inpatient And Ward

```txt
admissions
wards
rooms
beds
bed_assignments
nursing_notes
discharges
```

## Billing

```txt
invoices
invoice_items
payments
```

## Support

```txt
documents
notifications
reports
audit_logs
```

## Key Relationships

- `patients` are referenced by appointments, encounters, admissions, invoices, and audit logs.
- `encounters` represent actual clinical visits and should be referenced by triage records, clinical notes, diagnoses, orders, prescriptions, admissions, and invoices.
- `admissions` represent inpatient stays and should be referenced by bed assignments, nursing notes, discharges, and inpatient billing items.
- `beds` should not directly store patient history. Use `bed_assignments` to track movement over time.
- `audit_logs` should reference the acting user and the affected entity.

## Example Shapes

```ts
Patient {
  medicalRecordNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: Date;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
```

```ts
Encounter {
  patientId: ObjectId;
  type: "OUTPATIENT" | "EMERGENCY" | "FOLLOW_UP";
  status: "OPEN" | "CLOSED" | "CANCELLED";
  reason?: string;
  startedAt: Date;
  endedAt?: Date;
}
```

```ts
Admission {
  patientId: ObjectId;
  encounterId: ObjectId;
  status: "ADMITTED" | "TRANSFERRED" | "DISCHARGED" | "CANCELLED";
  admittedAt: Date;
  dischargedAt?: Date;
  reason?: string;
}
```

```ts
BedAssignment {
  admissionId: ObjectId;
  bedId: ObjectId;
  startedAt: Date;
  endedAt?: Date;
}
```

