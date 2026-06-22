import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import { getAuditLogById, getAuditLogs } from './audit-log.controller';

const router = Router();

router.get('/audit-logs', requirePermission('view_audit_logs'), getAuditLogs);
router.get('/audit-logs/:id', requirePermission('view_audit_logs'), getAuditLogById);

export default router;

