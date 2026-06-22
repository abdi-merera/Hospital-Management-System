import type { Request, Response } from 'express';
import {
  createDoctorRecord,
  deleteDoctorRecord,
  findDoctorById,
  listDoctors,
  updateDoctorRecord,
} from './doctor.service';
import { validateDoctorPayload } from './doctor.validation';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export async function getDoctors(req: Request, res: Response) {
  try {
    const doctors = await listDoctors(req.query.name as string | undefined);
    return res.json(doctors);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const doctor = await findDoctorById(getParam(req.params.id));
    return res.json(doctor);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

export async function createDoctor(req: Request, res: Response) {
  const validation = validateDoctorPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await createDoctorRecord(req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateDoctor(req: Request, res: Response) {
  const validation = validateDoctorPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await updateDoctorRecord(getParam(req.params.id), req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function deleteDoctor(req: Request, res: Response) {
  try {
    const deletedDoctor = await deleteDoctorRecord(getParam(req.params.id));

    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    return res.status(200).json(deletedDoctor);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
