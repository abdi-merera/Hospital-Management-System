import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import {
  assignBed,
  createBedRecord,
  createRoomRecord,
  createWardRecord,
  endBedAssignment,
  listBedAssignments,
  listBeds,
  listRooms,
  listWards,
  updateBedRecord,
  updateRoomRecord,
  updateWardRecord,
} from './ward.service';
import type { AuthSender, WardFilters } from './ward.types';
import { validateBedAssignmentPayload, validateBedPayload, validateRoomPayload, validateWardPayload } from './ward.validation';

type AuthenticatedRequest = Request & { sender?: AuthSender };

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

function getFilters(req: Request): WardFilters {
  return {
    wardId: getQuery(req.query.wardId),
    roomId: getQuery(req.query.roomId),
    admissionId: getQuery(req.query.admissionId),
    bedId: getQuery(req.query.bedId),
    status: getQuery(req.query.status) as WardFilters['status'],
  };
}

export async function getWards(_req: Request, res: Response) {
  try {
    return res.json({ message: 'success', wards: await listWards() });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createWard(req: Request, res: Response) {
  const validation = validateWardPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    return res.status(201).json({ message: 'success', ward: await createWardRecord(req.body) });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateWard(req: Request, res: Response) {
  try {
    const ward = await updateWardRecord(getParam(req.params.id), req.body);
    if (!ward) return res.status(404).json({ message: 'error', errors: ['Ward not found'] });
    return res.json({ message: 'success', ward });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getRooms(req: Request, res: Response) {
  try {
    return res.json({ message: 'success', rooms: await listRooms(getFilters(req)) });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createRoom(req: Request, res: Response) {
  const validation = validateRoomPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    return res.status(201).json({ message: 'success', room: await createRoomRecord(req.body) });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateRoom(req: Request, res: Response) {
  try {
    const room = await updateRoomRecord(getParam(req.params.id), req.body);
    if (!room) return res.status(404).json({ message: 'error', errors: ['Room not found'] });
    return res.json({ message: 'success', room });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getBeds(req: Request, res: Response) {
  try {
    return res.json({ message: 'success', beds: await listBeds(getFilters(req)) });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createBed(req: Request, res: Response) {
  const validation = validateBedPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    return res.status(201).json({ message: 'success', bed: await createBedRecord(req.body) });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateBed(req: Request, res: Response) {
  try {
    const bed = await updateBedRecord(getParam(req.params.id), req.body);
    if (!bed) return res.status(404).json({ message: 'error', errors: ['Bed not found'] });
    return res.json({ message: 'success', bed });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getBedAssignments(req: Request, res: Response) {
  try {
    return res.json({ message: 'success', bedAssignments: await listBedAssignments(getFilters(req)) });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createBedAssignment(req: AuthenticatedRequest, res: Response) {
  const validation = validateBedAssignmentPayload(req.body);
  if (!validation.status) return res.status(400).json({ message: 'error', errors: validation.errors });

  try {
    const bedAssignment = await assignBed(req.body, req.sender);
    void writeAuditLog({
      req,
      action: 'ASSIGN_BED',
      entity: 'BedAssignment',
      entityId: String(bedAssignment._id),
      metadata: {
        admissionId: String(bedAssignment.admissionId),
        bedId: String(bedAssignment.bedId),
      },
    });
    return res.status(201).json({ message: 'success', bedAssignment });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function closeBedAssignment(req: AuthenticatedRequest, res: Response) {
  try {
    const bedAssignment = await endBedAssignment(getParam(req.params.id), req.body, req.sender);
    if (!bedAssignment) return res.status(404).json({ message: 'error', errors: ['Bed assignment not found'] });
    void writeAuditLog({
      req,
      action: 'END_BED_ASSIGNMENT',
      entity: 'BedAssignment',
      entityId: getParam(req.params.id),
      metadata: { bedId: String(bedAssignment.bedId) },
    });
    return res.json({ message: 'success', bedAssignment });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
