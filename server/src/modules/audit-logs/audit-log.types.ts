import type { Request } from 'express';

export interface AuthSender {
  id: string;
  userType: 'Admin' | 'Staff' | 'Patient';
}

export type AuditedRequest = Request & {
  sender?: AuthSender;
};

export interface AuditLogPayload {
  req?: AuditedRequest;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
}
