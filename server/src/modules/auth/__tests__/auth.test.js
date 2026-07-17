const test = require('node:test');
const assert = require('node:assert/strict');

const { validateRegisterInput, validateLoginInput } = require('../validators/auth.validators');

test('register input validation rejects short names', () => {
  const errors = validateRegisterInput({ fullName: 'A', email: 'test@example.com', password: '12345678' });
  assert(errors.includes('fullName must be at least 2 characters long'));
});

test('login validation requires password', () => {
  const errors = validateLoginInput({ email: 'test@example.com' });
  assert(errors.includes('Password is required'));
});
