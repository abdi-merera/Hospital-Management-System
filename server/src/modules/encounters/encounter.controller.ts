import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  closeEncounterRecord,
  createEncounterRecord,
  findEncounterById,
  listEncounters,
  updateEncounterRecord,
} from './encounter.service';
import type { AuthSender, EncounterFilters } from './encounter.types';
import { validateEncounterPayload, validateEncounterUpdatePayload } from './encounter.validation';

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

export async function getEncounters(req: AuthenticatedRequest, res: Response) {
  try {
    const filters: EncounterFilters = {
      patientId: getQuery(req.query.patientId),
      appointmentId: getQuery(req.query.appointmentId),
      type: getQuery(req.query.type) as EncounterFilters['type'],
      status: getQuery(req.query.status) as EncounterFilters['status'],
    };

    const encounters = await listEncounters(filters, req.sender);
    return res.json({ message: 'success', encounters });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getEncounterById(req: Request, res: Response) {
  try {
    const encounter = await findEncounterById(getParam(req.params.id));

    if (!encounter) {
      return res.status(404).json({ message: 'error', errors: ['Encounter not found'] });
    }

    return res.json({ message: 'success', encounter });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createEncounter(req: AuthenticatedRequest, res: Response) {
  const validation = validateEncounterPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const encounter = await createEncounterRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_ENCOUNTER',
      entity: 'Encounter',
      entityId: String(encounter._id),
      metadata: { patientId: String(encounter.patientId), type: encounter.type },
    });
    return res.status(201).json({ message: 'success', encounter });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateEncounter(req: AuthenticatedRequest, res: Response) {
  const validation = validateEncounterUpdatePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const encounter = await updateEncounterRecord(getParam(req.params.id), req.body);

    if (!encounter) {
      return res.status(404).json({ message: 'error', errors: ['Encounter not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_ENCOUNTER',
      entity: 'Encounter',
      entityId: getParam(req.params.id),
      metadata: { status: encounter.status, type: encounter.type },
    });
    return res.json({ message: 'success', encounter });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function closeEncounter(req: AuthenticatedRequest, res: Response) {
  try {
    const encounter = await closeEncounterRecord(getParam(req.params.id));

    if (!encounter) {
      return res.status(404).json({ message: 'error', errors: ['Encounter not found'] });
    }

    void writeAuditLog({
      req,
      action: 'CLOSE_ENCOUNTER',
      entity: 'Encounter',
      entityId: getParam(req.params.id),
    });
    return res.json({ message: 'success', encounter });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
