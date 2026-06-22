import { Router } from 'express';
import { userAuth } from '../../middleware/auth.middleware';
import {
  bookAppointment,
  createAppointmentSlot,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  getDepartments,
  updateAppointmentById,
} from './appointment.controller';

const router = Router();

router.get('/departments', getDepartments);
router.get('/appointments/:id', getAppointmentById);
router.post('/appointments', userAuth, getAppointments);
router.post('/appointments/add', userAuth, createAppointmentSlot);
router.put('/appointments', userAuth, bookAppointment);
router.put('/appointments/:id', updateAppointmentById);
router.delete('/appointments', deleteAppointment);

export default router;
