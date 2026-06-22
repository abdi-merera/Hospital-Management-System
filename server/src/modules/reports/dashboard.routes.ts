import { Router } from 'express';
import { doctorAuth, requirePermission, userAuth } from '../../middleware/auth.middleware';
import {
  getAppointmentCount,
  getPatientsTreatedCount,
  getReportSummary,
  getUserCountByRole,
} from './dashboard.controller';

const router = Router();

router.post('/count/users', userAuth, getUserCountByRole);
router.get('/count/appointments', userAuth, getAppointmentCount);
router.get('/count/patients/treated', doctorAuth, getPatientsTreatedCount);
router.get('/reports/summary', requirePermission('view_reports'), getReportSummary);

export default router;
