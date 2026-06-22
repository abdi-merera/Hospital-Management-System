import type { Request, Response } from 'express';
import {
  createMedicineRecord,
  deleteMedicineRecord,
  findMedicineById,
  listMedicines,
  updateMedicineRecord,
} from './medicine.service';
import { validateMedicinePayload } from './medicine.validation';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

export async function getMedicines(req: Request, res: Response) {
  try {
    const medicines = await listMedicines(getQuery(req.query.name));
    return res.json(medicines);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getMedicineById(req: Request, res: Response) {
  try {
    const medicine = await findMedicineById(getParam(req.params.id));
    return res.json(medicine);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

export async function createMedicine(req: Request, res: Response) {
  const validation = validateMedicinePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await createMedicineRecord(req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateMedicine(req: Request, res: Response) {
  const validation = validateMedicinePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await updateMedicineRecord(getParam(req.params.id), req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function deleteMedicine(req: Request, res: Response) {
  try {
    const deletedMedicine = await deleteMedicineRecord(getParam(req.params.id));
    return res.status(200).json(deletedMedicine);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
