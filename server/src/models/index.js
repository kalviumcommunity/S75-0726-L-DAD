/**
 * Central model entry point for application bootstrap code.
 * Domain modules retain ownership of their schemas while callers get one stable import.
 */
module.exports = {
  User: require('../modules/auth/models/User'),
  Shipment: require('../modules/shipments/models/Shipment'),
  WarehouseTransfer: require('../modules/warehouse-transfers/models/WarehouseTransfer'),
  DelayReport: require('../modules/delay-reports/models/DelayReport'),
  AuditLog: require('../modules/activity-log/models/AuditLog'),
};
