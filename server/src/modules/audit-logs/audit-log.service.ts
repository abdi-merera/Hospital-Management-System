import mongoose from 'mongoose';
import { AuditLog } from './audit-log.model';
import type { AuditLogFilters, AuditLogPayload } from './audit-log.types';

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

function getClientIp(req: AuditLogPayload['req']) {
  if (!req) return undefined;

  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  return req.ip || req.socket?.remoteAddress;
}

export function writeAuditLog(payload: AuditLogPayload) {
  const userId = payload.userId || payload.req?.sender?.id;

  return AuditLog.create({
    userId: userId ? objectId(userId) : undefined,
    action: payload.action,
    entity: payload.entity,
    entityId: payload.entityId ? objectId(payload.entityId) : undefined,
    ipAddress: getClientIp(payload.req),
    userAgent: payload.req?.headers['user-agent'],
    metadata: payload.metadata,
  }).catch((error: any) => {
    console.error('Failed to write audit log:', error.message);
  });
}

export function listAuditLogs(filters: AuditLogFilters) {
  const query: Record<string, unknown> = {};

  if (filters.userId) query.userId = objectId(filters.userId);
  if (filters.action) query.action = filters.action;
  if (filters.entity) query.entity = filters.entity;
  if (filters.entityId) query.entityId = objectId(filters.entityId);

  return AuditLog.find(query)
    .populate({ path: 'userId', select: 'firstName lastName email userType' })
    .sort({ createdAt: -1 })
    .limit(500);
}

export function findAuditLogById(id: string) {
  return AuditLog.findById(id).populate({ path: 'userId', select: 'firstName lastName email userType' });
}
