import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { Patient, User } from './auth.model';
import type { SignupPayload } from './auth.validation';
import { getUserPermissionCodes } from '../roles-permissions/roles-permissions.service';
import { Role } from '../roles-permissions/roles-permissions.model';
import { defaultRoleByUserType } from '../roles-permissions/roles-permissions.seed';

interface VerificationToken {
  token: string;
  expires: number;
}

export async function authenticateUser(email: string, password: string) {
  const user = await User.findOne({ email }).populate({ path: 'roles', select: 'name description systemRole' });

  if (!user) {
    return { status: 401, body: { message: 'error', errors: ['User not found'] } };
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return { status: 401, body: { message: 'error', errors: ['Invalid password'] } };
  }

  const permissionCodes = await getUserPermissionCodes(String(user._id), user.userType);

  const currentUser = {
    firstName: user.firstName,
    lastName: user.lastName,
    userType: user.userType,
    userId: user._id,
    roles: user.roles || [],
    permissions: permissionCodes,
  };

  const token = jwt.sign({ id: user._id, userType: user.userType }, env.secretKey, { expiresIn: '365d' });

  return {
    status: 200,
    body: {
      message: 'success',
      user: currentUser,
      token,
    },
  };
}

export function generateVerificationToken(): VerificationToken {
  return {
    token: crypto.randomBytes(64).toString('hex'),
    expires: Date.now() + 3 * 60 * 60 * 1000,
  };
}

export function saveVerificationToken(userId: string, verificationToken: VerificationToken) {
  return User.findOneAndUpdate({ _id: userId }, { verificationToken });
}

export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log('Skipping verification email because GMAIL_USER or GMAIL_PASS is not set.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Verify your email address',
    text: `Please click the following link to verify your email address: http://localhost:3001/verify/${token}`,
    html: `<p>Please click this link to verify your account:</p> <a href="http://localhost:3001/verify/${token}">Verify</a>`,
  });
}

export async function registerUser(newUser: SignupPayload) {
  const roleName = newUser.userType ? defaultRoleByUserType[newUser.userType] : null;
  const role = roleName ? await Role.findOne({ name: roleName }) : null;

  const userDetails = await User.create({
    email: newUser.email,
    username: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    password: newUser.password,
    userType: newUser.userType,
    roles: role ? [role._id] : [],
  });

  const verificationToken = generateVerificationToken();
  await saveVerificationToken(userDetails._id, verificationToken);

  try {
    if (newUser.userType === 'Patient') {
      await Patient.create({
        userId: userDetails._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        username: newUser.email,
      });
    }
  } catch (error) {
    await User.deleteOne({ _id: userDetails._id });
    throw error;
  }

  sendVerificationEmail(userDetails.email, verificationToken.token).catch((error) => {
    console.error('Failed to send verification email:', error.message);
  });
}

export async function verifyUserEmail(token: string) {
  return User.findOneAndUpdate(
    {
      'verificationToken.token': token,
      'verificationToken.expires': { $gt: Date.now() },
    },
    {
      activated: true,
      'verificationToken.token': null,
    },
  );
}
