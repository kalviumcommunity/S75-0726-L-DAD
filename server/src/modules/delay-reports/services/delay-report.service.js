const DelayReport = require('../models/DelayReport');
const ShipmentRepository = require('../../shipments/repositories/shipment.repository');
const { ACTIVITY_TYPES } = require('../../../constants/logistics.constants');
const { logActivity } = require('../../activity-log/services/activity-log.service');

function serviceError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function createDelayReport(input, actorId) {
  const shipmentId = String(input.shipmentId || '').trim().toUpperCase();
  const shipment = await ShipmentRepository.findShipmentByBusinessKey(shipmentId);
  if (!shipment) throw serviceError(404, 'Shipment not found');

  const delayReport = await DelayReport.create({
    shipment: shipment._id,
    delayReason: String(input.delayReason || '').trim(),
    delayCategory: input.delayCategory,
    delayTimestamp: input.delayTimestamp || new Date(),
    reportedBy: actorId,
    remarks: String(input.remarks || '').trim(),
  });

  await logActivity(ACTIVITY_TYPES.DELAY_REPORT_ADDED, actorId, {
    entityType: 'DelayReport',
    entityId: delayReport._id,
    shipmentId: shipment.shipmentId,
    delayCategory: delayReport.delayCategory,
  });

  return delayReport;
}

module.exports = { createDelayReport };
