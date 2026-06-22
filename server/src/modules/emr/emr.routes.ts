import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  createClinicalNote,
  createDiagnosis,
  getClinicalNoteById,
  getClinicalNotes,
  getDiagnoses,
  getDiagnosisById,
  updateClinicalNote,
  updateDiagnosis,
} from './emr.controller';

const router = Router();

router.get('/clinical-notes', requirePermission('view_emr'), getClinicalNotes);
router.get('/clinical-notes/:id', requirePermission('view_emr'), getClinicalNoteById);
router.post('/clinical-notes', requirePermission('create_clinical_note'), createClinicalNote);
router.patch('/clinical-notes/:id', requirePermission('update_clinical_note'), updateClinicalNote);

router.get('/diagnoses', requirePermission('view_emr'), getDiagnoses);
router.get('/diagnoses/:id', requirePermission('view_emr'), getDiagnosisById);
router.post('/diagnoses', requirePermission('create_diagnosis'), createDiagnosis);
router.patch('/diagnoses/:id', requirePermission('update_diagnosis'), updateDiagnosis);

export default router;

