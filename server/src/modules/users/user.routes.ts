import { Router } from 'express';
import { adminAuth } from '../../middleware/auth.middleware';
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from './user.controller';

const router = Router();

router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserById);
router.post('/users', adminAuth, createUser);
router.patch('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);

export default router;
