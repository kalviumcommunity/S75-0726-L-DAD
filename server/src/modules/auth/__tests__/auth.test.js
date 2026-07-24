const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateProfileInput,
  validatePasswordChangeInput,
} = require('../validators/auth.validators');

test('register input validation rejects short names', () => {
  const errors = validateRegisterInput({ fullName: 'A', email: 'test@example.com', password: '12345678' });
  assert(errors.includes('fullName must be at least 2 characters long'));
});

test('login validation requires password', () => {
  const errors = validateLoginInput({ email: 'test@example.com' });
  assert(errors.includes('Password is required'));
});

test('profile settings validation rejects invalid email updates', () => {
  const errors = validateUpdateProfileInput({ fullName: 'A', email: 'invalid-email' });
  assert(errors.includes('fullName must be at least 2 characters long'));
  assert(errors.includes('Please provide a valid email address'));
});

test('password change validation rejects weak or mismatched new passwords', () => {
  const errors = validatePasswordChangeInput({ currentPassword: '12345678', newPassword: 'short' });
  assert(errors.includes('New password must be at least 8 characters long'));
});

test('password change validation rejects a confirmation mismatch', () => {
  const errors = validatePasswordChangeInput({
    currentPassword: '12345678',
    newPassword: 'newPassword1',
    confirmPassword: 'differentPassword1',
  });
  assert(errors.includes('New password confirmation does not match'));
});
