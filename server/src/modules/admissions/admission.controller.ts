import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  createAdmissionRecord,
  dischargeAdmissionRecord,
  findAdmissionById,
  listAdmissions,
  updateAdmissionRecord,
} from './admission.service';
import type { AdmissionFilters, AuthSender } from './admission.types';
import { validateAdmissionPayload, validateAdmissionUpdatePayload } from './admission.validation';

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

export async function getAdmissions(req: Request, res: Response) {
  try {
    const filters: AdmissionFilters = {
      patientId: getQuery(req.query.patientId),
      encounterId: getQuery(req.query.encounterId),
      status: getQuery(req.query.status) as AdmissionFilters['status'],
    };

    const admissions = await listAdmissions(filters);
    return res.json({ message: 'success', admissions });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getAdmissionById(req: Request, res: Response) {
  try {
    const admission = await findAdmissionById(getParam(req.params.id));

    if (!admission) {
      return res.status(404).json({ message: 'error', errors: ['Admission not found'] });
    }

    return res.json({ message: 'success', admission });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createAdmission(req: AuthenticatedRequest, res: Response) {
  const validation = validateAdmissionPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const admission = await createAdmissionRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_ADMISSION',
      entity: 'Admission',
      entityId: String(admission._id),
      metadata: {
        encounterId: String(admission.encounterId),
        patientId: String(admission.patientId),
      },
    });
    return res.status(201).json({ message: 'success', admission });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateAdmission(req: AuthenticatedRequest, res: Response) {
  const validation = validateAdmissionUpdatePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const admission = await updateAdmissionRecord(getParam(req.params.id), req.body);

    if (!admission) {
      return res.status(404).json({ message: 'error', errors: ['Admission not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_ADMISSION',
      entity: 'Admission',
      entityId: getParam(req.params.id),
      metadata: { status: admission.status },
    });
    return res.json({ message: 'success', admission });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function dischargeAdmission(req: AuthenticatedRequest, res: Response) {
  try {
    const admission = await dischargeAdmissionRecord(getParam(req.params.id), req.body, req.sender);

    if (!admission) {
      return res.status(404).json({ message: 'error', errors: ['Admission not found'] });
    }

    void writeAuditLog({
      req,
      action: 'DISCHARGE_ADMISSION',
      entity: 'Admission',
      entityId: getParam(req.params.id),
      metadata: { dischargedAt: admission.dischargedAt },
    });
    return res.json({ message: 'success', admission });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
