const test = require('node:test');
const assert = require('node:assert/strict');
const { validateExportQuery } = require('../services/report.service');

test('rejects unsupported shipment status filters', () => {
  const { errors } = validateExportQuery({ status: 'Unknown State' });

  assert.ok(errors.some((error) => error.includes('status')));
});

test('accepts valid date range filters and normalizes values', () => {
  const { errors, normalizedInput } = validateExportQuery({
    status: 'In Transit',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
  });

  assert.equal(errors.length, 0);
  assert.equal(normalizedInput.status, 'In Transit');
  assert.ok(normalizedInput.startDate instanceof Date);
  assert.ok(normalizedInput.endDate instanceof Date);
});

test('rejects an end date that precedes the start date', () => {
  const { errors } = validateExportQuery({
    startDate: '2024-02-01',
    endDate: '2024-01-31',
  });

  assert.ok(errors.some((error) => error.includes('endDate')));
});
