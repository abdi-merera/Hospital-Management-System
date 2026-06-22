import { Router } from 'express';
import { adminAuth } from '../../middleware/auth.middleware';
import {
  createPermission,
  createRole,
  getPermissions,
  getRoles,
  getUserPermissions,
  seedRolesAndPermissions,
  updateRolePermissions,
  updateUserRoles,
} from './roles-permissions.controller';

const router = Router();

router.post('/roles-permissions/seed', adminAuth, seedRolesAndPermissions);
router.get('/permissions', adminAuth, getPermissions);
router.post('/permissions', adminAuth, createPermission);
router.get('/roles', adminAuth, getRoles);
router.post('/roles', adminAuth, createRole);
router.put('/roles/:id/permissions', adminAuth, updateRolePermissions);
router.put('/users/:id/roles', adminAuth, updateUserRoles);
router.get('/users/:id/permissions', adminAuth, getUserPermissions);

export default router;

