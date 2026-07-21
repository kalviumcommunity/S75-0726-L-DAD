const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');
const ShipmentRepository = require('../repositories/shipment.repository');

const SHIPMENT_STATUS_FLOW = Object.freeze({
  [SHIPMENT_STATUSES.DISPATCHED]: [SHIPMENT_STATUSES.IN_TRANSIT, SHIPMENT_STATUSES.AT_WAREHOUSE, SHIPMENT_STATUSES.DELAYED, SHIPMENT_STATUSES.DELIVERED],
  [SHIPMENT_STATUSES.IN_TRANSIT]: [SHIPMENT_STATUSES.AT_WAREHOUSE, SHIPMENT_STATUSES.DELAYED, SHIPMENT_STATUSES.DELIVERED],
  [SHIPMENT_STATUSES.AT_WAREHOUSE]: [SHIPMENT_STATUSES.IN_TRANSIT, SHIPMENT_STATUSES.DELAYED, SHIPMENT_STATUSES.DELIVERED],
  [SHIPMENT_STATUSES.DELAYED]: [SHIPMENT_STATUSES.IN_TRANSIT, SHIPMENT_STATUSES.AT_WAREHOUSE, SHIPMENT_STATUSES.DELIVERED],
  [SHIPMENT_STATUSES.DELIVERED]: [],
});

const SHIPMENT_POPULATE = true;

function createServiceError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
}

function formatDate(value) {
  if (value == null || value === '') {
    return value == null ? null : value;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toISOString();
}

function formatUserRef(value, expandUser = false) {
  if (value == null) {
    return null;
  }

  const userData = value.toObject ? value.toObject() : value;
  const userId = userData._id?.toString?.() || userData.id?.toString?.() || String(userData);

  if (!expandUser) {
    return userId;
  }

  return {
    id: userId,
    fullName: userData.fullName || null,
  };
}

function normalizeShipment(document, { expandUsers = false } = {}) {
  if (!document) {
    return null;
  }

  const shipment = document.toObject ? document.toObject() : document;
  return {
    id: shipment._id?.toString?.() || shipment.id?.toString?.() || null,
    shipmentId: shipment.shipmentId,
    origin: shipment.origin,
    destination: shipment.destination,
    currentStatus: shipment.currentStatus,
    dispatchDate: formatDate(shipment.dispatchDate),
    expectedDeliveryDate: formatDate(shipment.expectedDeliveryDate),
    actualDeliveryDate: formatDate(shipment.actualDeliveryDate),
    currentLocation: shipment.currentLocation,
    createdBy: formatUserRef(shipment.createdBy, expandUsers),
    updatedBy: formatUserRef(shipment.updatedBy, expandUsers),
    createdAt: formatDate(shipment.createdAt),
    updatedAt: formatDate(shipment.updatedAt),
  };
}

function buildMongoValidationDetails(error) {
  return Object.values(error.errors || {}).map((entry) => entry.message).filter(Boolean);
}

function validateStatusTransition(existingStatus, nextStatus) {
  if (!nextStatus || nextStatus === existingStatus) {
    return;
  }

  const allowedStatuses = SHIPMENT_STATUS_FLOW[existingStatus] || [];
  if (!allowedStatuses.includes(nextStatus)) {
    throw createServiceError(
      422,
      `Invalid shipment status transition from ${existingStatus} to ${nextStatus}`,
    );
  }
}

function ensureDeliveredDateRules(shipment) {
  if (shipment.currentStatus === SHIPMENT_STATUSES.DELIVERED && !shipment.actualDeliveryDate) {
    throw createServiceError(422, 'actualDeliveryDate is required when currentStatus is Delivered');
  }
}

function applyShipmentUpdate(shipment, updates) {
  Object.entries(updates).forEach(([key, value]) => {
    shipment[key] = value;
  });
}

function buildShipmentFilter(input) {
  const filter = {};

  if (input.status) {
    filter.currentStatus = input.status;
  }

  const allowedDateFields = ['dispatchDate', 'expectedDeliveryDate', 'actualDeliveryDate'];
  const dateField = allowedDateFields.includes(input.dateField) ? input.dateField : 'dispatchDate';

  if (input.fromDate || input.toDate) {
    filter[dateField] = {};
    if (input.fromDate) {
      filter[dateField].$gte = new Date(input.fromDate);
    }
    if (input.toDate) {
      filter[dateField].$lte = new Date(input.toDate);
    }
  }

  if (input.search) {
    filter.$text = { $search: input.search };
  }

  return filter;
}

function buildSortObject(sortBy, sortOrder) {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
}

async function createShipment(input, actorId) {
  try {
    const shipment = await ShipmentRepository.createShipment({
      ...input,
      createdBy: actorId,
      updatedBy: actorId,
    });

    return {
      shipment: normalizeShipment(shipment, { expandUsers: false }),
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw createServiceError(409, 'A shipment with this shipmentId already exists');
    }

    if (error?.name === 'ValidationError') {
      throw createServiceError(422, 'Shipment validation failed', buildMongoValidationDetails(error));
    }

    throw error;
  }
}

async function getShipmentByBusinessKey(shipmentId) {
  const shipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId, { populate: SHIPMENT_POPULATE });

  if (!shipment) {
    throw createServiceError(404, 'Shipment not found');
  }

  return {
    shipment: normalizeShipment(shipment, { expandUsers: true }),
  };
}

async function listShipments(input) {
  const filter = buildShipmentFilter(input);
  const sort = buildSortObject(input.sortBy, input.sortOrder);
  const skip = (input.page - 1) * input.limit;

  const [totalItems, shipments] = await Promise.all([
    ShipmentRepository.countShipments(filter),
    ShipmentRepository.listShipments(filter, {
      populate: SHIPMENT_POPULATE,
      sort,
      skip,
      limit: input.limit,
    }),
  ]);

  return {
    shipments: shipments.map((shipment) => normalizeShipment(shipment, { expandUsers: true })),
    meta: {
      page: input.page,
      limit: input.limit,
      totalItems,
      totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / input.limit),
    },
  };
}

async function updateShipment(shipmentId, input, actorId) {
  const shipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId);

  if (!shipment) {
    throw createServiceError(404, 'Shipment not found');
  }

  if (input.currentStatus && input.currentStatus !== shipment.currentStatus) {
    validateStatusTransition(shipment.currentStatus, input.currentStatus);
  }

  if (input.actualDeliveryDate != null && input.actualDeliveryDate !== '' && input.currentStatus !== SHIPMENT_STATUSES.DELIVERED && shipment.currentStatus !== SHIPMENT_STATUSES.DELIVERED) {
    throw createServiceError(422, 'actualDeliveryDate can only be set when the shipment is Delivered');
  }

  applyShipmentUpdate(shipment, input);
  shipment.updatedBy = actorId;

  ensureDeliveredDateRules(shipment);

  try {
    await ShipmentRepository.saveShipment(shipment);
  } catch (error) {
    if (error?.code === 11000) {
      throw createServiceError(409, 'A shipment with this shipmentId already exists');
    }

    if (error?.name === 'ValidationError') {
      throw createServiceError(422, 'Shipment validation failed', buildMongoValidationDetails(error));
    }

    throw error;
  }

  const updatedShipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId, { populate: SHIPMENT_POPULATE });

  return {
    shipment: normalizeShipment(updatedShipment, { expandUsers: false }),
  };
}

async function deleteShipment(shipmentId) {
  const shipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId);

  if (!shipment) {
    throw createServiceError(404, 'Shipment not found');
  }

  const dependencyCounts = await ShipmentRepository.countShipmentDependencies(shipment._id);
  if (dependencyCounts.totalCount > 0) {
    throw createServiceError(409, 'Shipment cannot be deleted because dependent transfer or delay records exist', dependencyCounts);
  }

  await ShipmentRepository.deleteShipment(shipment);

  return {
    shipmentId,
  };
}

module.exports = {
  createShipment,
  getShipmentByBusinessKey,
  listShipments,
  updateShipment,
  deleteShipment,
  normalizeShipment,
  validateStatusTransition,
};