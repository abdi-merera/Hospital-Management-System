import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  createTriage,
  getEncounterTriageRecords,
  getTriageRecordById,
  getTriageRecords,
  updateTriage,
} from './triage.controller';

const router = Router();

router.get('/triage-records', requirePermission('view_triage'), getTriageRecords);
router.get('/triage-records/:id', requirePermission('view_triage'), getTriageRecordById);
router.get('/encounters/:encounterId/triage', requirePermission('view_triage'), getEncounterTriageRecords);
router.post('/triage-records', requirePermission('create_triage'), createTriage);
router.patch('/triage-records/:id', requirePermission('update_triage'), updateTriage);

export default router;

