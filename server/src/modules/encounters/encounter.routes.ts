import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  closeEncounter,
  createEncounter,
  getEncounterById,
  getEncounters,
  updateEncounter,
} from './encounter.controller';

const router = Router();

router.get('/encounters', requirePermission('view_encounter'), getEncounters);
router.get('/encounters/:id', requirePermission('view_encounter'), getEncounterById);
router.post('/encounters', requirePermission('create_encounter'), createEncounter);
router.patch('/encounters/:id', requirePermission('update_encounter'), updateEncounter);
router.patch('/encounters/:id/close', requirePermission('close_encounter'), closeEncounter);

export default router;

