import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  createTriageRecord,
  findTriageRecordById,
  findTriageRecordsByEncounter,
  listTriageRecords,
  updateTriageRecord,
} from './triage.service';
import type { AuthSender, TriageFilters } from './triage.types';
import { validateTriagePayload, validateTriageUpdatePayload } from './triage.validation';

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

export async function getTriageRecords(req: Request, res: Response) {
  try {
    const filters: TriageFilters = {
      encounterId: getQuery(req.query.encounterId),
      patientId: getQuery(req.query.patientId),
    };

    const triageRecords = await listTriageRecords(filters);
    return res.json({ message: 'success', triageRecords });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getTriageRecordById(req: Request, res: Response) {
  try {
    const triageRecord = await findTriageRecordById(getParam(req.params.id));

    if (!triageRecord) {
      return res.status(404).json({ message: 'error', errors: ['Triage record not found'] });
    }

    return res.json({ message: 'success', triageRecord });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function getEncounterTriageRecords(req: Request, res: Response) {
  try {
    const triageRecords = await findTriageRecordsByEncounter(getParam(req.params.encounterId));
    return res.json({ message: 'success', triageRecords });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

export async function createTriage(req: AuthenticatedRequest, res: Response) {
  const validation = validateTriagePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const triageRecord = await createTriageRecord(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'CREATE_TRIAGE',
      entity: 'TriageRecord',
      entityId: String(triageRecord._id),
      metadata: {
        encounterId: String(triageRecord.encounterId),
        patientId: String(triageRecord.patientId),
      },
    });
    return res.status(201).json({ message: 'success', triageRecord });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateTriage(req: AuthenticatedRequest, res: Response) {
  const validation = validateTriageUpdatePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const triageRecord = await updateTriageRecord(getParam(req.params.id), req.body);

    if (!triageRecord) {
      return res.status(404).json({ message: 'error', errors: ['Triage record not found'] });
    }

    void writeAuditLog({
      req,
      action: 'UPDATE_TRIAGE',
      entity: 'TriageRecord',
      entityId: getParam(req.params.id),
      metadata: { encounterId: String(triageRecord.encounterId) },
    });
    return res.json({ message: 'success', triageRecord });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
