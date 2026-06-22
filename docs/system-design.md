# HMIS System Design

## Overview

This project is moving toward a modular Hospital Management Information System (HMIS). The system supports the main operational and clinical workflows of a health facility: patient registration, appointments, outpatient and emergency visits, triage, clinical records, inpatient admissions, ward and bed management, billing, roles, permissions, reports, and audit logging.

The current implementation will evolve toward this stack:

- Frontend: React, Vite, TypeScript
- Backend: Express, TypeScript
- Database: MongoDB
- ODM: Mongoose
- API style: REST
- Authentication: JWT
- Validation: Zod or Joi

The existing Green Hills Hospital visual identity must be preserved while the internal structure is improved.

## Design Constraints

- Keep the current green hospital color palette and clean dashboard layout.
- Keep changes incremental so the current working app does not get broken by a large rewrite.
- Build around real hospital workflows, not only technical CRUD screens.
- Store major HMIS concepts in separate MongoDB collections instead of placing everything inside one patient document.
- Use `encounters` as the central clinical workflow record.

## Current Palette Direction

The current interface uses a green-first hospital palette:

- Primary green: `#31b372`
- Dark active green: `#155734`
- Light clinical backgrounds: `#efececa7`, `#ebe8e8`, `#f6fff9`
- Neutral panel/header gray: `#E0E0E0`
- White cards and table surfaces
- Black and gray body text

New screens should reuse this palette unless there is a specific design reason to extend it.

## Target Folder Structure

```txt
hmis/
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ assets/
│  │  ├─ components/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  ├─ routes/
│  │  ├─ hooks/
│  │  ├─ types/
│  │  ├─ utils/
│  │  ├─ constants/
│  │  ├─ store/
│  │  └─ main.tsx
│  ├─ index.html
│  └─ package.json
│
├─ server/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ middleware/
│  │  ├─ common/
│  │  ├─ utils/
│  │  ├─ routes/
│  │  ├─ modules/
│  │  └─ app.ts
│  ├─ tests/
│  └─ package.json
│
├─ shared/
├─ docs/
├─ package.json
├─ README.md
├─ .env.example
└─ docker-compose.yml
```

## Backend Module Pattern

Each backend feature should use the same shape:

```txt
module-name/
├─ module.model.ts
├─ module.controller.ts
├─ module.service.ts
├─ module.routes.ts
├─ module.validation.ts
└─ module.types.ts
```

Larger modules may contain multiple models. For example, `wards` can contain `ward.model.ts`, `room.model.ts`, `bed.model.ts`, and `bed-assignment.model.ts`.

## Core Workflow

```txt
Patient Registration
        ↓
Appointment / Walk-in / Emergency
        ↓
Encounter Created
        ↓
Triage / Vital Signs
        ↓
Doctor Consultation
        ↓
Orders
   ┌──────────────┬──────────────┬──────────────┐
   ↓              ↓              ↓
Laboratory     Radiology      Prescription
   ↓              ↓              ↓
Results       Report        Pharmacy Dispensing
        ↓
Decision
   ┌──────────────┬──────────────┬──────────────┐
   ↓              ↓              ↓
Outpatient    Admission      Referral
Treatment     to Ward        Outside Facility
                ↓
              Bed Assigned
                ↓
           Inpatient Care
                ↓
             Discharge
                ↓
              Billing
```

## Clinical Center: Encounters

Appointments are scheduling records. The actual clinical visit starts with an encounter.

An encounter should represent:

- Outpatient visit
- Emergency visit
- Follow-up visit

Records such as triage, clinical notes, diagnoses, orders, prescriptions, invoices, and admissions should generally reference `encounterId`.

## MVP Modules

The first working version should focus on:

```txt
auth
users
roles-permissions
staff
departments
patients
appointments
encounters
triage
emr
admissions
wards
billing
audit-logs
```

Later versions can add:

```txt
orders
laboratory
radiology
pharmacy
inventory
insurance
documents
notifications
reports
```

## Recommended Build Order

1. Foundation: auth, users, roles, permissions, departments, staff.
2. Patient flow: patients, appointments, walk-in encounter, outpatient encounter.
3. Clinical flow: triage, clinical notes, diagnoses, treatment plan.
4. Inpatient flow: admissions, wards, rooms, beds, bed assignments, discharge.
5. Billing flow: invoices, invoice items, payments.
6. Audit flow: user activity and sensitive record tracking.
7. Extended services: lab, radiology, pharmacy, inventory, insurance, reports.

## Data Design Principle

Do not store all patient activity inside the patient document.

Use separate collections linked by ObjectId references:

```txt
patients
appointments
encounters
triage_records
clinical_notes
diagnoses
admissions
bed_assignments
invoices
payments
audit_logs
```

This keeps records smaller, preserves history, and makes permissions and reports easier to manage.

