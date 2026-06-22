import type { Request, Response } from 'express';
import {
  createSlots,
  findAppointmentById,
  listAppointments,
  listDepartments,
  removeAppointment,
  reserveAppointment,
  updateAppointment,
} from './appointment.service';
import type { AuthSender } from './appointment.types';

type AuthenticatedRequest = Request & {
  sender?: AuthSender;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export async function getDepartments(_req: Request, res: Response) {
  try {
    const departments = await listDepartments();
    return res.json({ message: 'success', departments });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}

export async function getAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const appointments = await listAppointments(req.body, req.sender as AuthSender);
    return res.json({ message: 'success', appointments });
  } catch (error: any) {
    return res.status(500).json({ errors: [error.message] });
  }
}

export async function createAppointmentSlot(req: AuthenticatedRequest, res: Response) {
  try {
    await createSlots(req.body, req.sender);
    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(404).json({ errors: [error.message] });
  }
}

export async function bookAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const appointment = await reserveAppointment(req.body, req.sender);

    if (!appointment) {
      return res.status(404).json({ errors: ['Could not book appointment. Please Try again.'] });
    }

    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(404).json({ errors: [error.message] });
  }
}

export async function deleteAppointment(req: Request, res: Response) {
  try {
    const appointment = await removeAppointment(req.body);

    if (!appointment) {
      return res.status(404).json({ errors: ['Could not delete appointment'] });
    }

    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(404).json({ errors: [error.message] });
  }
}

export async function getAppointmentById(req: Request, res: Response) {
  try {
    const appointment = await findAppointmentById(getParam(req.params.id));

    if (!appointment) {
      return res.status(404).json({ errors: ['Appointment not found'] });
    }

    return res.json({ message: 'success', appointment });
  } catch (error: any) {
    return res.status(404).json({ errors: [error.message] });
  }
}

export async function updateAppointmentById(req: Request, res: Response) {
  try {
    const appointment = await updateAppointment(getParam(req.params.id), req.body);

    if (!appointment) {
      return res.status(404).json({ errors: ['Appointment not found'] });
    }

    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(404).json({ errors: [error.message] });
  }
}
