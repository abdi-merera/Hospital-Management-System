import mongoose from 'mongoose';
import { Permission, Role, RolePermission, User } from './roles-permissions.model';
import { defaultPermissions, defaultRoleByUserType, defaultRoles } from './roles-permissions.seed';
import type { PermissionPayload, RolePayload } from './roles-permissions.types';

function objectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export async function ensureDefaultRolesAndPermissions() {
  const permissionByCode = new Map<string, any>();

  for (const permission of defaultPermissions) {
    const savedPermission = await Permission.findOneAndUpdate(
      { code: permission.code },
      { $setOnInsert: permission },
      { new: true, upsert: true },
    );
    permissionByCode.set(permission.code, savedPermission);
  }

  const roleByName = new Map<string, any>();

  for (const role of defaultRoles) {
    const savedRole = await Role.findOneAndUpdate(
      { name: role.name },
      {
        $setOnInsert: {
          name: role.name,
          description: role.description,
          systemRole: true,
        },
      },
      { new: true, upsert: true },
    );

    roleByName.set(role.name, savedRole);

    for (const permissionCode of role.permissions) {
      const permission = permissionByCode.get(permissionCode);

      if (permission) {
        await RolePermission.findOneAndUpdate(
          { roleId: savedRole._id, permissionId: permission._id },
          { $setOnInsert: { roleId: savedRole._id, permissionId: permission._id } },
          { upsert: true },
        );
      }
    }
  }

  for (const [userType, roleName] of Object.entries(defaultRoleByUserType)) {
    const role = roleByName.get(roleName);

    if (role) {
      await User.updateMany(
        {
          userType,
          $or: [{ roles: { $exists: false } }, { roles: { $size: 0 } }],
        },
        { $set: { roles: [role._id] } },
      );
    }
  }
}

export function listPermissions() {
  return Permission.find({}).sort({ code: 1 });
}

export async function createPermissionRecord(payload: PermissionPayload) {
  return Permission.create({
    code: payload.code,
    description: payload.description,
  });
}

export async function listRoles() {
  const roles = await Role.find({}).sort({ name: 1 }).lean();

  return Promise.all(
    roles.map(async (role: any) => {
      const rolePermissions = await RolePermission.find({ roleId: role._id }).populate('permissionId').lean();
      return {
        ...role,
        permissions: rolePermissions.map((rolePermission: any) => rolePermission.permissionId),
      };
    }),
  );
}

export async function createRoleRecord(payload: RolePayload) {
  const role = await Role.create({
    name: payload.name,
    description: payload.description,
    systemRole: false,
  });

  await setRolePermissions(String(role._id), payload.permissions || []);

  return role;
}

export async function setRolePermissions(roleId: string, permissionCodes: string[]) {
  const permissions = await Permission.find({ code: { $in: permissionCodes } });

  await RolePermission.deleteMany({ roleId: objectId(roleId) });

  for (const permission of permissions) {
    await RolePermission.create({
      roleId: objectId(roleId),
      permissionId: permission._id,
    });
  }
}

export async function assignRolesToUser(userId: string, roleIds: string[]) {
  return User.findByIdAndUpdate(
    userId,
    {
      roles: roleIds.map(objectId),
    },
    { new: true },
  );
}

export async function getUserPermissionCodes(userId: string, userType?: string) {
  const user = await User.findById(userId).lean();

  if (!user) {
    return [];
  }

  let roleIds = user.roles || [];

  if (roleIds.length === 0 && userType) {
    const roleName = defaultRoleByUserType[userType];
    const role = roleName ? await Role.findOne({ name: roleName }).lean() : null;
    roleIds = role ? [role._id] : [];
  }

  if (roleIds.length === 0) {
    return [];
  }

  const rolePermissions = await RolePermission.find({ roleId: { $in: roleIds } }).populate('permissionId').lean();
  return [...new Set(rolePermissions.map((rolePermission: any) => rolePermission.permissionId.code))];
}

export async function userHasPermission(userId: string, permissionCode: string, userType?: string) {
  const permissionCodes = await getUserPermissionCodes(userId, userType);
  return permissionCodes.includes(permissionCode);
}

