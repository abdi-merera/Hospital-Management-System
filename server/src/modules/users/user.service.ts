import { Doctor, Patient, User } from './user.model';
import { Role } from '../roles-permissions/roles-permissions.model';
import { defaultRoleByUserType } from '../roles-permissions/roles-permissions.seed';
import type { UserPayload } from './user.validation';

export async function listUsers(name?: string, role?: string) {
  const conditions: Record<string, unknown>[] = [];

  if (name) {
    conditions.push({ firstName: name });
    conditions.push({ lastName: name });
  }

  if (role) {
    conditions.push({ userType: role });
  }

  if (conditions.length === 0) {
    return User.find({}).populate({ path: 'roles', select: 'name description systemRole' });
  }

  return User.find({ $or: conditions }).populate({ path: 'roles', select: 'name description systemRole' });
}

export function findUserById(id: string) {
  return User.findById(id).populate({ path: 'roles', select: 'name description systemRole' });
}

async function resolveRoleAssignment(payload: UserPayload) {
  const roleName = payload.userType ? defaultRoleByUserType[payload.userType] : null;
  const defaultRole = roleName ? await Role.findOne({ name: roleName }) : null;
  const selectedRoles = payload.roleIds?.length
    ? await Role.find({ _id: { $in: payload.roleIds } })
    : [];

  let allowedRoles = selectedRoles;

  if (payload.userType === 'Patient') {
    const patientRole = await Role.findOne({ name: 'Patient' });
    allowedRoles = patientRole ? [patientRole] : [];
  }

  if (payload.userType === 'Staff') {
    allowedRoles = selectedRoles.filter((item) => item.name !== 'Patient');
  }

  if (payload.userType === 'Admin') {
    allowedRoles = selectedRoles.filter((item) => item.name !== 'Patient');
  }

  const fallbackRoles = defaultRole ? [defaultRole] : [];
  const rolesToUse = allowedRoles.length > 0 ? allowedRoles : fallbackRoles;

  return {
    roleIds: rolesToUse.map((item) => item._id),
    roleNames: rolesToUse.map((item) => item.name),
  };
}

export async function createUserRecord(payload: UserPayload) {
  const { roleIds, roleNames } = await resolveRoleAssignment(payload);

  const userDetails = await User.create({
    email: payload.email,
    username: payload.username || payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
    password: payload.password,
    userType: payload.userType,
    roles: roleIds,
    activated: true,
  });

  try {
    if (payload.userType === 'Staff' && roleNames.includes('Doctor')) {
      await Doctor.create({
        userId: userDetails._id,
        email: payload.email,
        username: payload.username || payload.email,
      });
    }

    if (payload.userType === 'Patient') {
      await Patient.create({
        userId: userDetails._id,
        email: payload.email,
        username: payload.username || payload.email,
      });
    }
  } catch (error) {
    await User.deleteOne({ _id: userDetails._id });
    throw error;
  }
}

export async function updateUserRecord(id: string, payload: UserPayload) {
  const { roleIds, roleNames } = await resolveRoleAssignment(payload);

  await User.updateOne(
    { _id: id },
    {
      $set: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: payload.username || payload.email,
        email: payload.email,
        password: payload.password,
        userType: payload.userType,
        roles: roleIds,
      },
    },
  );

  if (payload.userType === 'Staff' && roleNames.includes('Doctor')) {
    const doctor = await Doctor.findOne({ userId: id });

    if (!doctor) {
      await Doctor.create({
        userId: id,
        email: payload.email,
        username: payload.username || payload.email,
      });
    }
  } else {
    await Doctor.deleteOne({ userId: id });
  }

  if (payload.userType === 'Patient') {
    const patient = await Patient.findOne({ userId: id });

    if (!patient) {
      await Patient.create({
        userId: id,
        email: payload.email,
        username: payload.username || payload.email,
      });
    }
  } else {
    await Patient.deleteOne({ userId: id });
  }
}

export async function deleteUserRecord(id: string) {
  const user = await User.findById(id);

  if (!user) {
    return null;
  }

  if (user.userType === 'Staff') {
    await Doctor.deleteOne({ userId: id });
  }

  if (user.userType === 'Patient') {
    await Patient.deleteOne({ userId: id });
  }

  return User.deleteOne({ _id: id });
}
