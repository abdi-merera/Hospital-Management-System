import type { Request, Response } from 'express';
import {
  createUserRecord,
  deleteUserRecord,
  findUserById,
  listUsers,
  updateUserRecord,
} from './user.service';
import { validateUserPayload } from './user.validation';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function getQuery(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : undefined;
  }

  return typeof value === 'string' ? value : undefined;
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await listUsers(getQuery(req.query.name), getQuery(req.query.role));
    return res.json(users);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = await findUserById(getParam(req.params.id));
    return res.json(user);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
}

export async function createUser(req: Request, res: Response) {
  const validation = validateUserPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await createUserRecord(req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateUser(req: Request, res: Response) {
  const validation = validateUserPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    await updateUserRecord(getParam(req.params.id), req.body);
    return res.status(201).json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const deletedUser = await deleteUserRecord(getParam(req.params.id));

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(deletedUser);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}
