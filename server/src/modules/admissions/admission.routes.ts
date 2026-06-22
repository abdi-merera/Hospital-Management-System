import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  createAdmission,
  dischargeAdmission,
  getAdmissionById,
  getAdmissions,
  updateAdmission,
} from './admission.controller';

const router = Router();

router.get('/admissions', requirePermission('view_admission'), getAdmissions);
router.get('/admissions/:id', requirePermission('view_admission'), getAdmissionById);
router.post('/admissions', requirePermission('create_admission'), createAdmission);
router.patch('/admissions/:id', requirePermission('update_admission'), updateAdmission);
router.patch('/admissions/:id/discharge', requirePermission('discharge_admission'), dischargeAdmission);

export default router;

