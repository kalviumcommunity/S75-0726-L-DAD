const {
  createShipment: createShipmentService,
  getShipmentByBusinessKey,
  listShipments,
  updateShipment: updateShipmentService,
  deleteShipment: deleteShipmentService,
  getShipmentTimeline,
} = require('../services/shipment.service');
const {
  validateCreateShipmentInput,
  validateUpdateShipmentInput,
  validateShipmentQueryInput,
  validateShipmentIdParam,
} = require('../validators/shipment.validators');
const logger = require('../../../utils/logger');

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };

  if (error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

function sendValidationError(res, details) {
  return sendError(res, {
    statusCode: 400,
    message: 'Validation failed',
    details,
  });
}

async function create(req, res) {
  try {
    const { errors, normalizedInput } = validateCreateShipmentInput(req.body);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const result = await createShipmentService(normalizedInput, req.user?.userId);
    logger.logShipment('CREATED', req.user?.userId, result.shipment.shipmentId);
    return res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: result.shipment,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getAll(req, res) {
  try {
    const { errors, normalizedInput } = validateShipmentQueryInput(req.query);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const result = await listShipments(normalizedInput);
    return res.status(200).json({
      success: true,
      message: 'Shipments fetched successfully',
      data: result.shipments,
      meta: result.meta,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getById(req, res) {
  try {
    const { isValid, shipmentId } = validateShipmentIdParam(req.params.id);
    if (!isValid) {
      return sendValidationError(res, ['shipmentId must be uppercase and contain only letters, numbers, and hyphens']);
    }

    const result = await getShipmentByBusinessKey(shipmentId);
    return res.status(200).json({
      success: true,
      message: 'Shipment fetched successfully',
      data: result.shipment,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function update(req, res) {
  try {
    const { isValid, shipmentId } = validateShipmentIdParam(req.params.id);
    if (!isValid) {
      return sendValidationError(res, ['shipmentId must be uppercase and contain only letters, numbers, and hyphens']);
    }

    const { errors, normalizedInput } = validateUpdateShipmentInput(req.body);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const result = await updateShipmentService(shipmentId, normalizedInput, req.user?.userId);
    const statusDetails = normalizedInput.currentStatus ? `status: ${normalizedInput.currentStatus}` : '';
    logger.logShipment('UPDATED', req.user?.userId, result.shipment.shipmentId, statusDetails);
    return res.status(200).json({
      success: true,
      message: 'Shipment updated successfully',
      data: result.shipment,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function remove(req, res) {
  try {
    const { isValid, shipmentId } = validateShipmentIdParam(req.params.id);
    if (!isValid) {
      return sendValidationError(res, ['shipmentId must be uppercase and contain only letters, numbers, and hyphens']);
    }

    await deleteShipmentService(shipmentId);
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
}

async function getTimeline(req, res) {
  try {
    const { isValid, shipmentId } = validateShipmentIdParam(req.params.id);
    if (!isValid) {
      return sendValidationError(res, ['shipmentId must be uppercase and contain only letters, numbers, and hyphens']);
    }

    const result = await getShipmentTimeline(shipmentId);
    return res.status(200).json({
      success: true,
      message: 'Shipment timeline fetched successfully',
      data: result.timeline,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getTimeline,
};