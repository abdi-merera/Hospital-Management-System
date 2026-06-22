import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  createPatient,
  deletePatient,
  getPatientById,
  getPatientHistory,
  getPatients,
  updatePatient,
} from './patient.controller';

const router = Router();

router.get('/patients', requirePermission('view_patient'), getPatients);
router.get('/patients/history/:id', requirePermission('view_emr'), getPatientHistory);
router.get('/patients/:id', requirePermission('view_patient'), getPatientById);
router.post('/patients', requirePermission('create_patient'), createPatient);
router.patch('/patients/:id', requirePermission('update_patient'), updatePatient);
router.delete('/patients/:id', requirePermission('delete_patient'), deletePatient);

export default router;
