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

function validateUpdateProfileInput(payload = {}) {
  const errors = [];
  const fullName = String(payload.fullName || '').trim();
  const email = String(payload.email || '').trim();

  if (!fullName) {
    errors.push('fullName is required');
  } else if (fullName.length < 2) {
    errors.push('fullName must be at least 2 characters long');
  }

  if (!email) {
    errors.push('email is required');
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  return errors;
}

function validatePasswordChangeInput(payload = {}) {
  const errors = [];
  const currentPassword = String(payload.currentPassword || '');
  const newPassword = String(payload.newPassword || '');

  if (!currentPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword) {
    errors.push('New password is required');
  } else if (newPassword.length < 8) {
    errors.push('New password must be at least 8 characters long');
  }

  return errors;
}

function validatePreferencesInput(payload = {}) {
  const errors = [];
  const theme = String(payload.theme || '').trim().toLowerCase();
  const notifications = payload.notificationPreferences || {};

  if (theme && !['light', 'dark'].includes(theme)) {
    errors.push('theme must be either light or dark');
  }

  const expectedNotificationFields = ['emailAlerts', 'pushNotifications', 'weeklyDigest'];
  expectedNotificationFields.forEach((field) => {
    if (notifications[field] !== undefined && typeof notifications[field] !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
  });

  return errors;
}

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateProfileInput,
  validatePasswordChangeInput,
  validatePreferencesInput,
};
