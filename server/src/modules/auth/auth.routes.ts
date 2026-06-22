import { Router } from 'express';
import { loginUser, signUp, verifyUser } from './auth.controller';

const router = Router();

router.post('/signup', signUp);
router.post('/login', loginUser);
router.get('/verify/:id', verifyUser);

export default router;
