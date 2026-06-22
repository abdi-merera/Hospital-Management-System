import { Router } from 'express';
import { requirePermission } from '../../middleware/auth.middleware';
import {
  closeBedAssignment,
  createBed,
  createBedAssignment,
  createRoom,
  createWard,
  getBedAssignments,
  getBeds,
  getRooms,
  getWards,
  updateBed,
  updateRoom,
  updateWard,
} from './ward.controller';

const router = Router();

router.get('/wards', requirePermission('manage_wards'), getWards);
router.post('/wards', requirePermission('manage_wards'), createWard);
router.patch('/wards/:id', requirePermission('manage_wards'), updateWard);

router.get('/rooms', requirePermission('manage_wards'), getRooms);
router.post('/rooms', requirePermission('manage_wards'), createRoom);
router.patch('/rooms/:id', requirePermission('manage_wards'), updateRoom);

router.get('/beds', requirePermission('view_beds'), getBeds);
router.post('/beds', requirePermission('manage_beds'), createBed);
router.patch('/beds/:id', requirePermission('manage_beds'), updateBed);

router.get('/bed-assignments', requirePermission('view_bed_assignments'), getBedAssignments);
router.post('/bed-assignments', requirePermission('assign_bed'), createBedAssignment);
router.patch('/bed-assignments/:id/end', requirePermission('assign_bed'), closeBedAssignment);

export default router;
