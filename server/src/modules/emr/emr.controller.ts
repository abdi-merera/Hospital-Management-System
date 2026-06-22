import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  createClinicalNoteRecord,
  createDiagnosisRecord,
  findClinicalNoteById,
  findDiagnosisById,
  listClinicalNotes,
  listDiagnoses,
  updateClinicalNoteRecord,
  updateDiagnosisRecord,
} from './emr.service';
import type { AuthSender, EmrFilters } from './emr.types';
import {
  validateClinicalNotePayload,
  validateClinicalNoteUpdatePayload,
  validateDiagnosisPayload,
  validateDiagnosisUpdatePayload,
} from './emr.validation';

type AuthenticatedRequest = Request & {
  sender?: AuthSender;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

function getFilters(req: Request): EmrFilters {
  return {
    encounterId: getQuery(req.query.encounterId),
    patientId: getQuery(req.query.patientId),
  };
}

export async function getClinicalNotes(req: Request, res: Response) {
  try {
    const clinicalNotes = await listClinicalNotes(getFilters(req));
    return res.json({ message: 'success', clinicalNotes });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getClinicalNoteById(req: Request, res: Response) {
  try {
    const clinicalNote = await findClinicalNoteById(getParam(req.params.id));

    if (!clinicalNote) {
      return res.status(404).json({ message: 'error', errors: ['Clinical note not found'] });
    }

    return res.json({ message: 'success', clinicalNote });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createClinicalNote(req: AuthenticatedRequest, res: Response) {
  const validation = validateClinicalNotePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const clinicalNote = await createClinicalNoteRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_CLINICAL_NOTE',
      entity: 'ClinicalNote',
      entityId: String(clinicalNote._id),
      metadata: {
        encounterId: String(clinicalNote.encounterId),
        patientId: String(clinicalNote.patientId),
      },
    });
    return res.status(201).json({ message: 'success', clinicalNote });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateClinicalNote(req: AuthenticatedRequest, res: Response) {
  const validation = validateClinicalNoteUpdatePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const clinicalNote = await updateClinicalNoteRecord(getParam(req.params.id), req.body);

    if (!clinicalNote) {
      return res.status(404).json({ message: 'error', errors: ['Clinical note not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_CLINICAL_NOTE',
      entity: 'ClinicalNote',
      entityId: getParam(req.params.id),
      metadata: { encounterId: String(clinicalNote.encounterId) },
    });
    return res.json({ message: 'success', clinicalNote });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getDiagnoses(req: Request, res: Response) {
  try {
    const diagnoses = await listDiagnoses(getFilters(req));
    return res.json({ message: 'success', diagnoses });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getDiagnosisById(req: Request, res: Response) {
  try {
    const diagnosis = await findDiagnosisById(getParam(req.params.id));

    if (!diagnosis) {
      return res.status(404).json({ message: 'error', errors: ['Diagnosis not found'] });
    }

    return res.json({ message: 'success', diagnosis });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createDiagnosis(req: AuthenticatedRequest, res: Response) {
  const validation = validateDiagnosisPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const diagnosis = await createDiagnosisRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_DIAGNOSIS',
      entity: 'Diagnosis',
      entityId: String(diagnosis._id),
      metadata: {
        encounterId: String(diagnosis.encounterId),
        patientId: String(diagnosis.patientId),
        diagnosisType: diagnosis.diagnosisType,
      },
    });
    return res.status(201).json({ message: 'success', diagnosis });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateDiagnosis(req: AuthenticatedRequest, res: Response) {
  const validation = validateDiagnosisUpdatePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const diagnosis = await updateDiagnosisRecord(getParam(req.params.id), req.body);

    if (!diagnosis) {
      return res.status(404).json({ message: 'error', errors: ['Diagnosis not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_DIAGNOSIS',
      entity: 'Diagnosis',
      entityId: getParam(req.params.id),
      metadata: { status: diagnosis.status },
    });
    return res.json({ message: 'success', diagnosis });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
