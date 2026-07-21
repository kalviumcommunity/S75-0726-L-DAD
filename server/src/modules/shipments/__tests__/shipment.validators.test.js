const test = require('node:test');
const assert = require('node:assert/strict');

const {
  validateCreateShipmentInput,
  validateUpdateShipmentInput,
  validateShipmentQueryInput,
} = require('../validators/shipment.validators');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

test('shipment create validation rejects invalid date ordering', () => {
  const { errors } = validateCreateShipmentInput({
    shipmentId: 'LDAD-SHP-10021',
    currentStatus: SHIPMENT_STATUSES.DISPATCHED,
    origin: 'Warehouse A',
    destination: 'Warehouse B',
    currentLocation: 'Warehouse A',
    dispatchDate: '2026-07-20T09:00:00.000Z',
    expectedDeliveryDate: '2026-07-19T09:00:00.000Z',
  });

  assert(errors.includes('expectedDeliveryDate cannot precede dispatchDate'));
});

test('shipment update validation rejects shipmentId changes', () => {
  const { errors } = validateUpdateShipmentInput({ shipmentId: 'NEW-ID' });
  assert(errors.includes('shipmentId cannot be updated'));
});

test('shipment query validation applies defaults', () => {
  const { errors, normalizedInput } = validateShipmentQueryInput({});

  assert.equal(errors.length, 0);
  assert.equal(normalizedInput.page, 1);
  assert.equal(normalizedInput.limit, 10);
});

test('shipment query validation accepts valid dateField', () => {
  const { errors, normalizedInput } = validateShipmentQueryInput({ dateField: 'expectedDeliveryDate' });

  assert.equal(errors.length, 0);
  assert.equal(normalizedInput.dateField, 'expectedDeliveryDate');
});

test('shipment query validation rejects invalid dateField', () => {
  const { errors } = validateShipmentQueryInput({ dateField: 'invalidField' });

  assert(errors.some((error) => error.includes('dateField must be one of')));
});