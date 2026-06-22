import type { Request, Response } from 'express';
import {
  assignRolesToUser,
  createPermissionRecord,
  createRoleRecord,
  ensureDefaultRolesAndPermissions,
  getUserPermissionCodes,
  listPermissions,
  listRoles,
  setRolePermissions,
} from './roles-permissions.service';
import { validatePermissionPayload, validateRolePayload } from './roles-permissions.validation';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export async function seedRolesAndPermissions(_req: Request, res: Response) {
  try {
    await ensureDefaultRolesAndPermissions();
    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function getPermissions(_req: Request, res: Response) {
  try {
    const permissions = await listPermissions();
    return res.json({ message: 'success', permissions });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createPermission(req: Request, res: Response) {
  const validation = validatePermissionPayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const permission = await createPermissionRecord(req.body);
    return res.status(201).json({ message: 'success', permission });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getRoles(_req: Request, res: Response) {
  try {
    const roles = await listRoles();
    return res.json({ message: 'success', roles });
  } catch (error: any) {
    return res.status(500).json({ message: 'error', errors: [error.message] });
  }
}

export async function createRole(req: Request, res: Response) {
  const validation = validateRolePayload(req.body);

  if (!validation.status) {
    return res.status(400).json({ message: 'error', errors: validation.errors });
  }

  try {
    const role = await createRoleRecord(req.body);
    return res.status(201).json({ message: 'success', role });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateRolePermissions(req: Request, res: Response) {
  try {
    await setRolePermissions(getParam(req.params.id), req.body.permissions || []);
    return res.json({ message: 'success' });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function updateUserRoles(req: Request, res: Response) {
  try {
    const user = await assignRolesToUser(getParam(req.params.id), req.body.roles || []);
    return res.json({ message: 'success', user });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

export async function getUserPermissions(req: Request, res: Response) {
  try {
    const permissions = await getUserPermissionCodes(getParam(req.params.id));
    return res.json({ message: 'success', permissions });
  } catch (error: any) {
    return res.status(400).json({ message: 'error', errors: [error.message] });
  }
}

