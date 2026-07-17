const { USER_ROLES } = require('../../../constants/logistics.constants');

function validateRegisterInput(payload = {}) {
  const errors = [];
  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim();
  const password = String(payload.password || '');
  const role = String(payload.role || '').trim();

  if (fullName.length < 2) {
    errors.push('fullName must be at least 2 characters long');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (role && !Object.values(USER_ROLES).includes(role)) {
    errors.push(`role must be one of: ${Object.values(USER_ROLES).join(', ')}`);
  }

  return errors;
}

function validateLoginInput(payload = {}) {
  const errors = [];
  const email = String(payload.email || '').trim();
  const password = String(payload.password || '');

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return errors;
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
};
