const Shipment = require('../../shipments/models/Shipment');
const DelayReport = require('../../delay-reports/models/DelayReport');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

function buildDateFilter(fromDate, toDate, fieldName = 'createdAt') {
  const range = {};

  if (fromDate) {
    const parsedFromDate = new Date(fromDate);
    if (!Number.isNaN(parsedFromDate.getTime())) {
      range.$gte = parsedFromDate;
    }
  }

  if (toDate) {
    const parsedToDate = new Date(toDate);
    if (!Number.isNaN(parsedToDate.getTime())) {
      range.$lte = parsedToDate;
    }
  }

  return Object.keys(range).length ? { [fieldName]: range } : {};
}

async function getTotals(filters = {}) {
  const [totalShipments, deliveredShipments, delayedShipments, inTransitShipments, atWarehouseShipments] = await Promise.all([
    Shipment.countDocuments(filters),
    Shipment.countDocuments({ ...filters, currentStatus: SHIPMENT_STATUSES.DELIVERED }),
    Shipment.countDocuments({ ...filters, currentStatus: SHIPMENT_STATUSES.DELAYED }),
    Shipment.countDocuments({ ...filters, currentStatus: SHIPMENT_STATUSES.IN_TRANSIT }),
    Shipment.countDocuments({ ...filters, currentStatus: SHIPMENT_STATUSES.AT_WAREHOUSE }),
  ]);

  return {
    totalShipments,
    deliveredShipments,
    delayedShipments,
    inTransitShipments,
    atWarehouseShipments,
  };
}

async function getStatusCounts(filters = {}) {
  const pipeline = [
    { $match: filters },
    { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    { $project: { _id: 0, label: '$_id', count: 1 } },
    { $sort: { count: -1, label: 1 } },
  ];

  return Shipment.aggregate(pipeline).exec();
}

async function getDelayCategoryCounts(filters = {}) {
  const pipeline = [
    { $match: filters },
    { $group: { _id: '$delayCategory', count: { $sum: 1 } } },
    { $project: { _id: 0, label: '$_id', count: 1 } },
    { $sort: { count: -1, label: 1 } },
  ];

  return DelayReport.aggregate(pipeline).exec();
}

async function getAverageDeliveryTime(filters = {}) {
  const pipeline = [
    {
      $match: {
        ...filters,
        currentStatus: SHIPMENT_STATUSES.DELIVERED,
        actualDeliveryDate: { $ne: null },
      },
    },
    {
      $project: {
        diffMs: { $subtract: ['$actualDeliveryDate', '$dispatchDate'] },
      },
    },
    {
      $group: {
        _id: null,
        avgMs: { $avg: '$diffMs' },
        sampleSize: { $sum: 1 },
      },
    },
  ];

  const [result] = await Shipment.aggregate(pipeline).exec();

  if (!result || result.avgMs == null) {
    return {
      averageDeliveryTimeHours: 0,
      sampleSize: 0,
    };
  }

  return {
    averageDeliveryTimeHours: Number((result.avgMs / (1000 * 60 * 60)).toFixed(2)),
    sampleSize: result.sampleSize,
  };
}

async function getRecentShipments(limit = 10, filters = {}) {
  const docs = await Shipment.find(filters)
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 10)
    .select('shipmentId origin destination currentStatus dispatchDate expectedDeliveryDate actualDeliveryDate createdAt')
    .lean()
    .exec();

  return docs;
}

async function getOverview(fromDate, toDate) {
  const filters = buildDateFilter(fromDate, toDate, 'createdAt');
  const [totals, averageDeliveryTime] = await Promise.all([
    getTotals(filters),
    getAverageDeliveryTime(filters),
  ]);

  return {
    ...totals,
    averageDeliveryTimeHours: averageDeliveryTime.averageDeliveryTimeHours,
  };
}

async function getDashboardSummary(options = {}) {
  const recentLimit = options.recentLimit || 10;
  const shipmentFilters = buildDateFilter(options.fromDate, options.toDate, 'createdAt');
  const delayFilters = buildDateFilter(options.fromDate, options.toDate, 'delayTimestamp');

  const [overview, statusCounts, delayCategoryCounts, averageDeliveryTime, recentShipments] = await Promise.all([
    getOverview(options.fromDate, options.toDate),
    getStatusCounts(shipmentFilters),
    getDelayCategoryCounts(delayFilters),
    getAverageDeliveryTime(shipmentFilters),
    getRecentShipments(recentLimit, shipmentFilters),
  ]);

  return {
    overview,
    statusCounts,
    delayCategoryCounts,
    averageDeliveryTime,
    recentShipments,
  };
}

module.exports = {
  buildDateFilter,
  getDashboardSummary,
  getOverview,
  getRecentShipments,
  getTotals,
  getStatusCounts,
  getDelayCategoryCounts,
  getAverageDeliveryTime,
};
