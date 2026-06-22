export const adminAuth = require('../../routes/middlewares/adminAuth');
export const doctorAuth = require('../../routes/middlewares/doctorAuth');
export const patientAuth = require('../../routes/middlewares/patientAuth');
export const userAuth = require('../../routes/middlewares/userAuth');

import type { NextFunction, Request, Response } from 'express';
import { userHasPermission } from '../modules/roles-permissions/roles-permissions.service';

type AuthenticatedRequest = Request & {
  sender?: {
    id: string;
    userType: string;
  };
};

export function requirePermission(permissionCode: string) {
  return [
    userAuth,
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      try {
        const sender = req.sender;

        if (!sender) {
          return res.status(401).json({ message: 'Unauthorized' });
        }

        const hasPermission = await userHasPermission(sender.id, permissionCode, sender.userType);

        if (!hasPermission) {
          return res.status(403).json({
            message: 'Forbidden',
            errors: [`Missing permission: ${permissionCode}`],
          });
        }

        return next();
      } catch (error: any) {
        return res.status(500).json({ message: 'error', errors: [error.message] });
      }
    },
  ];
}
