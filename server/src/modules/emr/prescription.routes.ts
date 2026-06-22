import { Router } from 'express';
import { doctorAuth, userAuth } from '../../middleware/auth.middleware';
import { createPrescription, getPrescriptions } from './prescription.controller';

const router = Router();

router.post('/prescriptions', userAuth, getPrescriptions);
router.post('/prescription', doctorAuth, createPrescription);

export default router;
