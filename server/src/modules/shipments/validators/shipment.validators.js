const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

const SHIPMENT_ID_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,49}$/;
const ALLOWED_SORT_FIELDS = new Set([
  'shipmentId',
  'currentStatus',
  'dispatchDate',
  'expectedDeliveryDate',
  'actualDeliveryDate',
  'createdAt',
  'updatedAt',
]);

function isValidDate(value) {
  if (value == null || value === '') {
    return false;
  }

  const parsedDate = new Date(value);
  return !Number.isNaN(parsedDate.getTime());
}

function toDate(value) {
  return new Date(value);
}

function validateShipmentId(shipmentId) {
  const normalizedShipmentId = String(shipmentId || '').trim().toUpperCase();
  return SHIPMENT_ID_PATTERN.test(normalizedShipmentId);
}

function validateTextField(errors, value, fieldName, minimumLength = 2, maximumLength = 150) {
  const text = String(value || '').trim();

  if (!text) {
    errors.push(`${fieldName} is required`);
    return text;
  }

  if (text.length < minimumLength) {
    errors.push(`${fieldName} must be at least ${minimumLength} characters long`);
  }

  if (text.length > maximumLength) {
    errors.push(`${fieldName} must be at most ${maximumLength} characters long`);
  }

  return text;
}

function validateCreateShipmentInput(payload = {}) {
  const errors = [];
  const shipmentId = String(payload.shipmentId || '').trim().toUpperCase();
  const currentStatus = String(payload.currentStatus || SHIPMENT_STATUSES.DISPATCHED).trim();
  const origin = validateTextField(errors, payload.origin, 'origin');
  const destination = validateTextField(errors, payload.destination, 'destination');
  const currentLocation = validateTextField(errors, payload.currentLocation, 'currentLocation');
  const dispatchDate = payload.dispatchDate;
  const expectedDeliveryDate = payload.expectedDeliveryDate;
  const actualDeliveryDate = payload.actualDeliveryDate;

  if (!shipmentId) {
    errors.push('shipmentId is required');
  } else if (!validateShipmentId(shipmentId)) {
    errors.push('shipmentId must be uppercase and contain only letters, numbers, and hyphens');
  }

  if (!Object.values(SHIPMENT_STATUSES).includes(currentStatus)) {
    errors.push(`currentStatus must be one of: ${Object.values(SHIPMENT_STATUSES).join(', ')}`);
  }

  if (!isValidDate(dispatchDate)) {
    errors.push('dispatchDate must be a valid date');
  }

  if (!isValidDate(expectedDeliveryDate)) {
    errors.push('expectedDeliveryDate must be a valid date');
  }

  if (isValidDate(dispatchDate) && isValidDate(expectedDeliveryDate) && toDate(expectedDeliveryDate) < toDate(dispatchDate)) {
    errors.push('expectedDeliveryDate cannot precede dispatchDate');
  }

  if (actualDeliveryDate != null && !isValidDate(actualDeliveryDate)) {
    errors.push('actualDeliveryDate must be a valid date when provided');
  }

  if (isValidDate(actualDeliveryDate) && isValidDate(dispatchDate) && toDate(actualDeliveryDate) < toDate(dispatchDate)) {
    errors.push('actualDeliveryDate cannot precede dispatchDate');
  }

  if (currentStatus === SHIPMENT_STATUSES.DELIVERED && actualDeliveryDate == null) {
    errors.push('actualDeliveryDate is required when currentStatus is Delivered');
  }

  return {
    errors,
    normalizedInput: {
      shipmentId,
      currentStatus,
      origin,
      destination,
      currentLocation,
      dispatchDate,
      expectedDeliveryDate,
      actualDeliveryDate: actualDeliveryDate == null || actualDeliveryDate === '' ? null : actualDeliveryDate,
    },
  };
}

function validateUpdateShipmentInput(payload = {}) {
  const errors = [];
  const normalizedInput = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'shipmentId')) {
    errors.push('shipmentId cannot be updated');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'currentStatus')) {
    const currentStatus = String(payload.currentStatus || '').trim();
    if (!Object.values(SHIPMENT_STATUSES).includes(currentStatus)) {
      errors.push(`currentStatus must be one of: ${Object.values(SHIPMENT_STATUSES).join(', ')}`);
    } else {
      normalizedInput.currentStatus = currentStatus;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'origin')) {
    normalizedInput.origin = validateTextField(errors, payload.origin, 'origin');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'destination')) {
    normalizedInput.destination = validateTextField(errors, payload.destination, 'destination');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'currentLocation')) {
    normalizedInput.currentLocation = validateTextField(errors, payload.currentLocation, 'currentLocation');
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'dispatchDate')) {
    if (!isValidDate(payload.dispatchDate)) {
      errors.push('dispatchDate must be a valid date');
    } else {
      normalizedInput.dispatchDate = payload.dispatchDate;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'expectedDeliveryDate')) {
    if (!isValidDate(payload.expectedDeliveryDate)) {
      errors.push('expectedDeliveryDate must be a valid date');
    } else {
      normalizedInput.expectedDeliveryDate = payload.expectedDeliveryDate;
    }
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'actualDeliveryDate')) {
    if (payload.actualDeliveryDate == null || payload.actualDeliveryDate === '') {
      normalizedInput.actualDeliveryDate = null;
    } else if (!isValidDate(payload.actualDeliveryDate)) {
      errors.push('actualDeliveryDate must be a valid date when provided');
    } else {
      normalizedInput.actualDeliveryDate = payload.actualDeliveryDate;
    }
  }

  if (Object.keys(normalizedInput).length === 0) {
    errors.push('At least one editable shipment field must be provided');
  }

  return {
    errors,
    normalizedInput,
  };
}

function validateShipmentQueryInput(query = {}) {
  const errors = [];
  const normalizedInput = {};

  if (query.page != null) {
    const page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      errors.push('page must be a positive integer');
    } else {
      normalizedInput.page = page;
    }
  } else {
    normalizedInput.page = 1;
  }

  if (query.limit != null) {
    const limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1) {
      errors.push('limit must be a positive integer');
    } else {
      normalizedInput.limit = limit;
    }
  } else {
    normalizedInput.limit = 10;
  }

  if (query.status != null && query.status !== '') {
    const status = String(query.status).trim();
    if (!Object.values(SHIPMENT_STATUSES).includes(status)) {
      errors.push(`status must be one of: ${Object.values(SHIPMENT_STATUSES).join(', ')}`);
    } else {
      normalizedInput.status = status;
    }
  }

  if (query.fromDate != null && query.fromDate !== '') {
    if (!isValidDate(query.fromDate)) {
      errors.push('fromDate must be a valid date');
    } else {
      normalizedInput.fromDate = query.fromDate;
    }
  }

  if (query.toDate != null && query.toDate !== '') {
    if (!isValidDate(query.toDate)) {
      errors.push('toDate must be a valid date');
    } else {
      normalizedInput.toDate = query.toDate;
    }
  }

  if (normalizedInput.fromDate && normalizedInput.toDate && toDate(normalizedInput.fromDate) > toDate(normalizedInput.toDate)) {
    errors.push('fromDate cannot be later than toDate');
  }

  normalizedInput.search = String(query.search || '').trim();

  const sortBy = String(query.sortBy || 'createdAt').trim();
  normalizedInput.sortBy = ALLOWED_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';

  const sortOrder = String(query.sortOrder || 'desc').trim().toLowerCase();
  normalizedInput.sortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

  return {
    errors,
    normalizedInput,
  };
}

function validateShipmentIdParam(id) {
  const shipmentId = String(id || '').trim().toUpperCase();
  return {
    isValid: validateShipmentId(shipmentId),
    shipmentId,
  };
}

module.exports = {
  validateCreateShipmentInput,
  validateUpdateShipmentInput,
  validateShipmentQueryInput,
  validateShipmentIdParam,
  validateShipmentId,
  SHIPMENT_ID_PATTERN,
};