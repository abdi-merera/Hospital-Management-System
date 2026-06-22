import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  createPatientRecord,
  deletePatientRecord,
  findPatientById,
  findPatientHistory,
  listPatients,
  updatePatientRecord,
} from './patient.service';
import { validatePatientPayload } from './patient.validation';

type AuthenticatedRequest = Request & {
  sender?: {
    id: string;
    userType: 'Admin' | 'Staff' | 'Patient';
  };
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export async function getPatients(req: Request, res: Response) {
  try {
    const patients = await listPatients(req.query.name as string | undefined);
    res.json(patients);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export async function getPatientById(req: Request, res: Response) {
  try {
    const patient = await findPatientById(getParam(req.params.id));
    res.json(patient);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
}

export async function createPatient(req: AuthenticatedRequest, res: Response) {
  const validation = validatePatientPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const patient = await createPatientRecord(req.body);
    void writeAuditLog({
      req,
      action: 'CREATE_PATIENT',
      entity: 'Patient',
      entityId: String(patient._id),
      metadata: { medicalRecordNo: patient.medicalRecordNo },
    });
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updatePatient(req: AuthenticatedRequest, res: Response) {
  const validation = validatePatientPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const patient = await updatePatientRecord(getParam(req.params.id), req.body);
    void writeAuditLog({
      req,
      action: 'UPDATE_PATIENT',
      entity: 'Patient',
      entityId: getParam(req.params.id),
      metadata: { medicalRecordNo: patient?.medicalRecordNo },
    });
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function deletePatient(req: Request, res: Response) {
  try {
    const deletedPatient = await deletePatientRecord(getParam(req.params.id));

    if (!deletedPatient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    return res.status(200).json(deletedPatient);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getPatientHistory(req: Request, res: Response) {
  try {
    const prescriptions = await findPatientHistory(getParam(req.params.id));

    return res.status(200).json({
      message: 'success',
      prescriptions,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
