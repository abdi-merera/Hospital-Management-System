import type { Request, Response } from 'express';
import { writeAuditLog } from '../audit-logs/audit-log.service';
import { authenticateUser, registerUser, verifyUserEmail } from './auth.service';
import { validateLogin, validateSignup } from './auth.validation';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export async function loginUser(req: Request, res: Response) {
  const validation = validateLogin(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const result = await authenticateUser(req.body.email, req.body.password);
    if (result.status === 200 && result.body.user?.userId) {
      void writeAuditLog({
        req,
        userId: String(result.body.user.userId),
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: String(result.body.user.userId),
        metadata: { userType: result.body.user.userType },
      });
    }
    return res.status(result.status).json(result.body);
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function signUp(req: Request, res: Response) {
  const validation = validateSignup(req.body);

  if (!validation.status) {
    return res.json({ message: 'error', errors: validation.errors });
  }

  try {
    await registerUser(req.body);
    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.json({ message: 'error', errors: [error.message] });
  }
}

export async function verifyUser(req: Request, res: Response) {
  try {
    const user = await verifyUserEmail(getParam(req.params.id));

    if (!user) {
      console.log('Email could not be verified');
      return res.status(500).json({ message: 'Error verifying account' });
    }

    console.log('Email verified');
    return res.send('Email verified');
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}
