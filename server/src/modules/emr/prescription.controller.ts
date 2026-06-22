import type { Request, Response } from 'express';
import { createPrescriptionRecord, listPrescriptions } from './prescription.service';
import type { AuthSender } from './prescription.types';
import { validatePrescriptionPayload } from './prescription.validation';

type AuthenticatedRequest = Request & {
  sender?: AuthSender;
};

export async function getPrescriptions(req: AuthenticatedRequest, res: Response) {
  try {
    const prescriptions = await listPrescriptions(req.body, req.sender as AuthSender);
    return res.json({ message: 'success', prescriptions });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function createPrescription(req: Request, res: Response) {
  const validation = validatePrescriptionPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await createPrescriptionRecord(req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}
