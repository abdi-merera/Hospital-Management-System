# Hospital Management Information System

This project is a Hospital Management Information System (HMIS). It is built with React on the frontend, Express/Node on the backend, and MongoDB for local data storage.

## Current MVP

- Login and role-based access control
- Patient, doctor, and user management
- Encounters for outpatient, emergency, and follow-up visits
- Triage and vital signs
- Doctor consultation notes and diagnoses
- Admissions, wards, rooms, beds, and bed assignment
- Billing, invoice items, and payments
- Audit log review
- Reports dashboard

## Requirements

- Node.js
- npm
- MongoDB installed locally
- MongoDB Compass is optional, but useful for beginners

MongoDB should be running locally at:

```txt
mongodb://127.0.0.1:27017
```

## Environment Setup

Create this file:

```txt
server/.env
```

Use these starter values:

```env
PORT=3001
MONGOCONNECTION=mongodb://127.0.0.1:27017/hospital-management-system
SECRET_KEY=change_me
GMAIL_USER=
GMAIL_PASS=
CLIENT_ID=
CLIENT_SECRET=
HOST=http://localhost:3000
```

Email values can stay blank during local development. The server skips verification email if Gmail credentials are not set.

## Install Dependencies

From the project root:

```powershell
npm.cmd install
```

If dependencies are missing inside `client` or `server`, run:

```powershell
cd client
npm.cmd install
```

```powershell
cd server
npm.cmd install
```

## Start The Backend

Open a terminal:

```powershell
cd D:\Projects\Hospital-Management-System\server
npm.cmd start
```

The backend should run on:

```txt
http://localhost:3001
```

If you see `EADDRINUSE`, port `3001` is already being used. Stop the other backend terminal, or find and stop the process using that port.

## Start The Frontend

Open a second terminal:

```powershell
cd D:\Projects\Hospital-Management-System\client
npm.cmd start
```

The frontend should run on:

```txt
http://localhost:3000
```

## Beginner Local Run Checklist

1. Start MongoDB locally.
2. Start the backend from `server`.
3. Start the frontend from `client`.
4. Open `http://localhost:3000`.
5. Sign up or log in.
6. If permissions look stale after changing roles, log out and log back in.

## Useful Pages

- `/` dashboard
- `/encounters`
- `/wards`
- `/billing`
- `/audit-logs`
- `/roles-permissions`
- `/reports`

## Verification Commands

Backend typecheck:

```powershell
cd D:\Projects\Hospital-Management-System\server
npm.cmd run typecheck
```

Frontend production build:

```powershell
cd D:\Projects\Hospital-Management-System\client
npm.cmd run build
```
