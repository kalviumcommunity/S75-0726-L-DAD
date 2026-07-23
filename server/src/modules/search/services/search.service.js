const Shipment = require('../../shipments/models/Shipment');
const WarehouseTransfer = require('../../warehouse-transfers/models/WarehouseTransfer');
const DelayReport = require('../../delay-reports/models/DelayReport');

function normalizeSearchTerm(term = '') {
  return String(term).trim().toLowerCase();
}

function buildSearchQuery(term) {
  const searchTerm = normalizeSearchTerm(term);
  const filters = [
    { field: 'shipmentId', regex: searchTerm },
    { field: 'origin', regex: searchTerm },
    { field: 'destination', regex: searchTerm },
    { field: 'currentLocation', regex: searchTerm },
    { field: 'fromWarehouse', regex: searchTerm },
    { field: 'toWarehouse', regex: searchTerm },
    { field: 'delayReason', regex: searchTerm },
    { field: 'remarks', regex: searchTerm },
  ];

  return { searchTerm, filters };
}

async function globalSearch(term = '', limit = 8) {
  const { searchTerm, filters } = buildSearchQuery(term);

  if (!searchTerm) {
    return { shipments: [], transfers: [], delayReports: [] };
  }

  const [shipments, transfers, delayReports] = await Promise.all([
    Shipment.find({
      $or: filters.filter(({ field }) => ['shipmentId', 'origin', 'destination', 'currentLocation'].includes(field)).map(({ field, regex }) => ({ [field]: { $regex: regex, $options: 'i' } })),
    }).limit(limit).lean(),
    WarehouseTransfer.find({
      $or: filters.filter(({ field }) => ['fromWarehouse', 'toWarehouse', 'remarks'].includes(field)).map(({ field, regex }) => ({ [field]: { $regex: regex, $options: 'i' } })),
    }).limit(limit).lean(),
    DelayReport.find({
      $or: filters.filter(({ field }) => ['delayReason', 'remarks'].includes(field)).map(({ field, regex }) => ({ [field]: { $regex: regex, $options: 'i' } })),
    }).limit(limit).lean(),
  ]);

  return {
    shipments: shipments.map((shipment) => ({
      id: shipment._id?.toString?.() || shipment.id,
      type: 'Shipment',
      label: shipment.shipmentId,
      subtitle: `${shipment.origin} → ${shipment.destination}`,
      value: shipment,
    })),
    transfers: transfers.map((transfer) => ({
      id: transfer._id?.toString?.() || transfer.id,
      type: 'Warehouse Transfer',
      label: `${transfer.fromWarehouse} → ${transfer.toWarehouse}`,
      subtitle: transfer.remarks || 'Transfer entry',
      value: transfer,
    })),
    delayReports: delayReports.map((report) => ({
      id: report._id?.toString?.() || report.id,
      type: 'Delay Report',
      label: report.delayReason,
      subtitle: report.remarks || 'Delay report',
      value: report,
    })),
  };
}

module.exports = { normalizeSearchTerm, buildSearchQuery, globalSearch };
