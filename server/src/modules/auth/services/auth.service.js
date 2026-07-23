const jwt = require('jsonwebtoken');
const { USER_ROLES, ACTIVITY_TYPES } = require('../../../constants/logistics.constants');
const UserRepository = require('../repositories/user.repository');
const { logActivity } = require('../../activity-log/services/activity-log.service');
const bcrypt = require('bcrypt');

function createAuthError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function createToken(user) {
  const secret = process.env.JWT_SECRET || 'ldad-dev-secret';
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: '12h' },
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const userData = user.toObject ? user.toObject() : user;
  delete userData.password;
  return userData;
}

async function registerUser(input) {
  const fullName = String(input.fullName || '').trim();
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');
  const role = String(input.role || USER_ROLES.COORDINATOR);

  if (!fullName || !email || !password) {
    throw createAuthError(400, 'fullName, email, and password are required');
  }

  const existingUser = await UserRepository.findUserByEmail(email);
  if (existingUser) {
    throw createAuthError(409, 'A user with this email already exists');
  }

  const createdUser = await UserRepository.createUser({
    fullName,
    email,
    password,
    role,
  });

  return {
    user: sanitizeUser(createdUser),
    token: createToken(createdUser),
  };
}

async function loginUser(input) {
  const email = String(input.email || '').trim().toLowerCase();
  const password = String(input.password || '');

  if (!email || !password) {
    throw createAuthError(400, 'email and password are required');
  }

  const existingUser = await UserRepository.findUserByEmailWithPassword(email);
  if (!existingUser) {
    throw createAuthError(401, 'Invalid email or password');
  }

  if (!existingUser.isActive) {
    throw createAuthError(403, 'Your account is inactive. Please contact a manager.');
  }

  const isPasswordValid = await existingUser.comparePassword(password);
  if (!isPasswordValid) {
    throw createAuthError(401, 'Invalid email or password');
  }

  // Log login activity
  await logActivity(ACTIVITY_TYPES.LOGIN, existingUser._id, {
    entityType: 'User',
    entityId: existingUser._id,
    email: existingUser.email,
  });

  return {
    user: sanitizeUser(existingUser),
    token: createToken(existingUser),
  };
}

async function getUserProfile(userId) {
  const user = await UserRepository.findUserById(userId);
  if (!user) {
    throw createAuthError(404, 'User not found');
  }

  return { user: sanitizeUser(user) };
}

async function updateUserProfile(userId, input) {
  const fullName = String(input.fullName || '').trim();
  const email = String(input.email || '').trim().toLowerCase();

  const existingUser = await UserRepository.findUserById(userId);
  if (!existingUser) {
    throw createAuthError(404, 'User not found');
  }

  const duplicate = await UserRepository.findUserByEmail(email);
  if (duplicate && duplicate._id.toString() !== userId) {
    throw createAuthError(409, 'A user with this email already exists');
  }

  const updatedUser = await UserRepository.updateUserById(userId, {
    fullName,
    email,
  });

  return { user: sanitizeUser(updatedUser) };
}

async function changeUserPassword(userId, input) {
  const currentPassword = String(input.currentPassword || '');
  const newPassword = String(input.newPassword || '');

  const existingUser = await UserRepository.findUserByIdWithPassword(userId);
  if (!existingUser) {
    throw createAuthError(404, 'User not found');
  }

  const isCurrentPasswordValid = await existingUser.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createAuthError(400, 'Current password is incorrect');
  }

  existingUser.password = newPassword;
  await existingUser.save();

  return { message: 'Password changed successfully' };
}

async function updateUserPreferences(userId, input) {
  const existingUser = await UserRepository.findUserById(userId);
  if (!existingUser) {
    throw createAuthError(404, 'User not found');
  }

  const theme = String(input.theme || existingUser.theme || 'light').trim().toLowerCase();
  const notificationPreferences = {
    emailAlerts: input.notificationPreferences?.emailAlerts ?? existingUser.notificationPreferences?.emailAlerts ?? true,
    pushNotifications: input.notificationPreferences?.pushNotifications ?? existingUser.notificationPreferences?.pushNotifications ?? true,
    weeklyDigest: input.notificationPreferences?.weeklyDigest ?? existingUser.notificationPreferences?.weeklyDigest ?? false,
  };

  const updatedUser = await UserRepository.updateUserById(userId, {
    theme,
    notificationPreferences,
  });

  return { user: sanitizeUser(updatedUser) };
}

async function logoutUser() {
  return {
    message: 'Logout successful. Please discard the token on the client side.',
  };
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateUserPreferences,
  logoutUser,
};
