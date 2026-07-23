const WarehouseTransfer = require('../models/WarehouseTransfer');
const ShipmentRepository = require('../../shipments/repositories/shipment.repository');
const { ACTIVITY_TYPES } = require('../../../constants/logistics.constants');
const { logActivity } = require('../../activity-log/services/activity-log.service');

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createTransfer(input, actorId) {
  const shipmentId = String(input.shipmentId || '').trim().toUpperCase();
  const shipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId);
  if (!shipment) throw serviceError(404, 'Shipment not found');

  const transfer = await WarehouseTransfer.create({
    shipment: shipment._id,
    fromWarehouse: String(input.fromWarehouse || '').trim(),
    toWarehouse: String(input.toWarehouse || '').trim(),
    transferTimestamp: input.transferTimestamp || new Date(),
    remarks: String(input.remarks || '').trim(),
    createdBy: actorId,
  });

  await logActivity(ACTIVITY_TYPES.TRANSFER_ADDED, actorId, {
    entityType: 'WarehouseTransfer',
    entityId: transfer._id,
    shipmentId: shipment.shipmentId,
    fromWarehouse: transfer.fromWarehouse,
    toWarehouse: transfer.toWarehouse,
  });

  return transfer;
}

module.exports = { createTransfer };
