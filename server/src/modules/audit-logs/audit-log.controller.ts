import type { Request, Response } from 'express';
import { findAuditLogById, listAuditLogs } from './audit-log.service';
import type { AuditLogFilters } from './audit-log.types';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
}

export async function getAuditLogs(req: Request, res: Response) {
  try {
    const filters: AuditLogFilters = {
      userId: getQuery(req.query.userId),
      action: getQuery(req.query.action),
      entity: getQuery(req.query.entity),
      entityId: getQuery(req.query.entityId),
    };
    const auditLogs = await listAuditLogs(filters);
    return res.json({ message: 'success', auditLogs });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getAuditLogById(req: Request, res: Response) {
  try {
    const auditLog = await findAuditLogById(getParam(req.params.id));

    if (!auditLog) {
      return res.status(404).json({ message: 'error', errors: ['Audit log not found'] });
    }

    return res.json({ message: 'success', auditLog });
  } catch (error: any) {
    return res.status(404).json({ message: 'error', errors: [error.message] });
  }
}

