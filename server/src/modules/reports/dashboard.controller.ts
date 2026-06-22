import type { Request, Response } from 'express';
import {
  countPatientsTreatedByDoctor,
  countTodayAppointments,
  countUsersByRole,
  getMvpReportSummary,
} from './dashboard.service';
import type { AuthSender } from './dashboard.types';

type AuthenticatedRequest = Request & {
  sender?: AuthSender;
};

export async function getUserCountByRole(req: Request, res: Response) {
  try {
    const userType = req.body.userType;

    if (!userType) {
      return res.status(400).json({ errors: ['User type is missing in body'] });
    }

    const count = await countUsersByRole(userType);
    return res.json({ count });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}

export async function getAppointmentCount(req: AuthenticatedRequest, res: Response) {
  try {
    const counts = await countTodayAppointments(req.sender as AuthSender);

    return res.json({
      message: 'success',
      totalAppointments: counts.totalAppointments,
      pendingAppointments: counts.pendingAppointments,
    });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}

export async function getPatientsTreatedCount(req: AuthenticatedRequest, res: Response) {
  try {
    const treatedPatients = await countPatientsTreatedByDoctor(String(req.sender?.doctorId));

    return res.json({
      message: 'success',
      treatedPatients,
    });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}

export async function getReportSummary(_req: Request, res: Response) {
  try {
    const summary = await getMvpReportSummary();

    return res.json({
      message: 'success',
      summary,
    });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}
