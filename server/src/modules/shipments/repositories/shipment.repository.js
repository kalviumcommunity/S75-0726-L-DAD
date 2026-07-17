const Shipment = require('../models/Shipment');
const WarehouseTransfer = require('../../warehouse-transfers/models/WarehouseTransfer');
const DelayReport = require('../../delay-reports/models/DelayReport');

async function createShipment(data) {
  return Shipment.create(data);
}

async function findShipmentByBusinessKey(shipmentId, options = {}) {
  let query = Shipment.findOne({ shipmentId });

  if (options.populate) {
    query = query
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');
  }

  return query.exec();
}

async function listShipments(filter = {}, options = {}) {
  let query = Shipment.find(filter);

  if (options.populate) {
    query = query
      .populate('createdBy', 'fullName')
      .populate('updatedBy', 'fullName');
  }

  if (options.sort) {
    query.sort(options.sort);
  }

  if (Number.isInteger(options.skip) && options.skip > 0) {
    query.skip(options.skip);
  }

  if (Number.isInteger(options.limit) && options.limit > 0) {
    query.limit(options.limit);
  }

  return query.exec();
}

async function countShipments(filter = {}) {
  return Shipment.countDocuments(filter);
}

async function countShipmentDependencies(shipmentObjectId) {
  const [transferCount, delayCount] = await Promise.all([
    WarehouseTransfer.countDocuments({ shipment: shipmentObjectId }),
    DelayReport.countDocuments({ shipment: shipmentObjectId }),
  ]);

  return {
    transferCount,
    delayCount,
    totalCount: transferCount + delayCount,
  };
}

async function saveShipment(document) {
  return document.save();
}

async function deleteShipment(document) {
  return document.deleteOne();
}

module.exports = {
  createShipment,
  findShipmentByBusinessKey,
  listShipments,
  countShipments,
  countShipmentDependencies,
  saveShipment,
  deleteShipment,
};