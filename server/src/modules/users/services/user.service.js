const { USER_ROLES } = require('../../../constants/logistics.constants');
const UserRepository = require('../../auth/repositories/user.repository');

function createError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

function normalizePage(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function listUsers(query = {}) {
  const page = normalizePage(query.page, 1);
  const limit = Math.min(normalizePage(query.limit, 20), 100);
  const search = String(query.search || '').trim();
  const role = String(query.role || '').trim();
  if (role && !Object.values(USER_ROLES).includes(role)) {
    throw createError(400, `role must be one of: ${Object.values(USER_ROLES).join(', ')}`);
  }

  const { users, totalItems } = await UserRepository.findUsers({ search, role, page, limit });
  return { users, meta: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) } };
}

async function editUser(userId, input, actorId) {
  const existing = await UserRepository.findUserById(userId);
  if (!existing) throw createError(404, 'User not found');

  const updates = {};
  if (input.fullName !== undefined) {
    const fullName = String(input.fullName).trim();
    if (fullName.length < 2 || fullName.length > 100) throw createError(400, 'fullName must be between 2 and 100 characters');
    updates.fullName = fullName;
  }
  if (input.email !== undefined) {
    const email = String(input.email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw createError(400, 'Please provide a valid email address');
    const duplicate = await UserRepository.findUserByEmail(email);
    if (duplicate && duplicate._id.toString() !== userId) throw createError(409, 'A user with this email already exists');
    updates.email = email;
  }
  if (input.role !== undefined) {
    if (!Object.values(USER_ROLES).includes(input.role)) throw createError(400, `role must be one of: ${Object.values(USER_ROLES).join(', ')}`);
    if (userId === actorId && input.role !== existing.role) throw createError(400, 'You cannot change your own role');
    updates.role = input.role;
  }
  if (Object.keys(updates).length === 0) throw createError(400, 'Provide at least one of: fullName, email, role');
  return UserRepository.updateUserById(userId, updates);
}

async function setUserActiveStatus(userId, isActive, actorId) {
  const existing = await UserRepository.findUserById(userId);
  if (!existing) throw createError(404, 'User not found');
  if (userId === actorId && !isActive) throw createError(400, 'You cannot deactivate your own account');
  return UserRepository.updateUserById(userId, { isActive });
}

module.exports = { listUsers, editUser, setUserActiveStatus };
