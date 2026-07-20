const { Parser } = require('json2csv');
const Shipment = require('../../shipments/models/Shipment');
const DelayReport = require('../../delay-reports/models/DelayReport');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

const SHIPMENT_EXPORT_FIELDS = [
  'shipmentId',
  'origin',
  'destination',
  'currentStatus',
  'dispatchDate',
  'expectedDeliveryDate',
  'actualDeliveryDate',
  'currentLocation',
  'createdAt',
  'updatedAt',
];

const DELAY_REPORT_EXPORT_FIELDS = [
  'shipmentId',
  'shipmentStatus',
  'delayReason',
  'delayCategory',
  'delayTimestamp',
  'reportedBy',
  'remarks',
  'createdAt',
];

function createServiceError(statusCode, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (details) {
    error.details = details;
  }
  return error;
}

function validateExportQuery(query = {}) {
  const errors = [];
  const normalizedInput = {};

  if (query.status) {
    const status = String(query.status).trim();
    if (!Object.values(SHIPMENT_STATUSES).includes(status)) {
      errors.push(`status must be one of: ${Object.values(SHIPMENT_STATUSES).join(', ')}`);
    } else {
      normalizedInput.status = status;
    }
  }

  if (query.startDate) {
    const startDate = new Date(query.startDate);
    if (Number.isNaN(startDate.getTime())) {
      errors.push('startDate must be a valid ISO date');
    } else {
      normalizedInput.startDate = startDate;
    }
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    if (Number.isNaN(endDate.getTime())) {
      errors.push('endDate must be a valid ISO date');
    } else {
      normalizedInput.endDate = endDate;
    }
  }

  if (normalizedInput.startDate && normalizedInput.endDate && normalizedInput.endDate < normalizedInput.startDate) {
    errors.push('endDate must be on or after startDate');
  }

  return { errors, normalizedInput };
}

function buildShipmentExportFilter(input) {
  const filter = {};

  if (input.status) {
    filter.currentStatus = input.status;
  }

  if (input.startDate || input.endDate) {
    filter.dispatchDate = {};
    if (input.startDate) {
      filter.dispatchDate.$gte = input.startDate;
    }
    if (input.endDate) {
      filter.dispatchDate.$lte = input.endDate;
    }
  }

  return filter;
}

function normalizeDate(value) {
  if (!value) {
    return '';
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function formatUserReference(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value.toObject) {
    return value.toObject()._id?.toString?.() || '';
  }

  return value._id?.toString?.() || '';
}

async function exportShipmentData(input) {
  const filter = buildShipmentExportFilter(input);
  const shipments = await Shipment.find(filter).lean();

  const rows = shipments.map((shipment) => ({
    shipmentId: shipment.shipmentId || '',
    origin: shipment.origin || '',
    destination: shipment.destination || '',
    currentStatus: shipment.currentStatus || '',
    dispatchDate: normalizeDate(shipment.dispatchDate),
    expectedDeliveryDate: normalizeDate(shipment.expectedDeliveryDate),
    actualDeliveryDate: normalizeDate(shipment.actualDeliveryDate),
    currentLocation: shipment.currentLocation || '',
    createdAt: normalizeDate(shipment.createdAt),
    updatedAt: normalizeDate(shipment.updatedAt),
  }));

  const parser = new Parser({ fields: SHIPMENT_EXPORT_FIELDS, withBOM: true });
  const csv = await parser.parseAsync(rows);

  return {
    csv,
    fileName: 'shipments-export.csv',
    rowCount: rows.length,
  };
}

async function exportDelayReportsData(input) {
  const shipmentFilter = buildShipmentExportFilter(input);
  const shipments = await Shipment.find(shipmentFilter).select('_id shipmentId currentStatus').lean();
  const shipmentIds = shipments.map((shipment) => shipment._id);

  const delayFilter = {};
  if (shipmentIds.length > 0) {
    delayFilter.shipment = { $in: shipmentIds };
  } else {
    delayFilter.shipment = null;
  }

  if (input.startDate || input.endDate) {
    delayFilter.delayTimestamp = {};
    if (input.startDate) {
      delayFilter.delayTimestamp.$gte = input.startDate;
    }
    if (input.endDate) {
      delayFilter.delayTimestamp.$lte = input.endDate;
    }
  }

  const reports = await DelayReport.find(delayFilter).populate('shipment', 'shipmentId currentStatus').lean();

  const rows = reports.map((report) => ({
    shipmentId: report.shipment?.shipmentId || '',
    shipmentStatus: report.shipment?.currentStatus || '',
    delayReason: report.delayReason || '',
    delayCategory: report.delayCategory || '',
    delayTimestamp: normalizeDate(report.delayTimestamp),
    reportedBy: formatUserReference(report.reportedBy),
    remarks: report.remarks || '',
    createdAt: normalizeDate(report.createdAt),
  }));

  const parser = new Parser({ fields: DELAY_REPORT_EXPORT_FIELDS, withBOM: true });
  const csv = await parser.parseAsync(rows);

  return {
    csv,
    fileName: 'delay-reports-export.csv',
    rowCount: rows.length,
  };
}

module.exports = {
  validateExportQuery,
  exportShipmentData,
  exportDelayReportsData,
  createServiceError,
};
