const Shipment = require('../../shipments/models/Shipment');
const DelayReport = require('../../delay-reports/models/DelayReport');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

function parseDateInput(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function startOfUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function endOfUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

function addUtcMonths(date, months) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

function formatMonthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(date) {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildTrendWindow(fromDate, toDate, fieldName, fallbackMonths = 12) {
  const parsedFromDate = parseDateInput(fromDate);
  const parsedToDate = parseDateInput(toDate);
  const endSource = parsedToDate || new Date();
  const startSource = parsedFromDate || addUtcMonths(startOfUtcMonth(endSource), -(fallbackMonths - 1));

  let startDate = startOfUtcMonth(startSource);
  let endDate = endOfUtcMonth(endSource);

  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  return {
    filter: {
      [fieldName]: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    startDate,
    endDate,
  };
}

function buildMonthSeries(startDate, endDate, rows, valueBuilder) {
  const dataByMonth = new Map(rows.map((row) => [row.monthKey, row]));
  const items = [];
  const cursor = new Date(startDate.getTime());

  while (cursor <= endDate) {
    const monthKey = formatMonthKey(cursor);
    const row = dataByMonth.get(monthKey);

    items.push(valueBuilder({
      monthKey,
      label: formatMonthLabel(cursor),
      row,
    }));

    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return items;
}

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

async function getMonthlyShipmentTrends(fromDate, toDate) {
  const { filter, startDate, endDate } = buildTrendWindow(fromDate, toDate, 'createdAt');
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$createdAt',
            timezone: 'UTC',
          },
        },
        shipmentCount: { $sum: 1 },
        deliveredCount: {
          $sum: {
            $cond: [{ $eq: ['$currentStatus', SHIPMENT_STATUSES.DELIVERED] }, 1, 0],
          },
        },
        delayedCount: {
          $sum: {
            $cond: [{ $eq: ['$currentStatus', SHIPMENT_STATUSES.DELAYED] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const rows = await Shipment.aggregate(pipeline).exec();

  return buildMonthSeries(startDate, endDate, rows.map((row) => ({
    monthKey: row._id,
    shipmentCount: row.shipmentCount || 0,
    deliveredCount: row.deliveredCount || 0,
    delayedCount: row.delayedCount || 0,
  })), ({ label, row }) => ({
    month: label,
    shipmentCount: row?.shipmentCount || 0,
    deliveredCount: row?.deliveredCount || 0,
    delayedCount: row?.delayedCount || 0,
  }));
}

async function getDeliveryPerformanceByRoute(fromDate, toDate, limit = 8) {
  const { filter } = buildTrendWindow(fromDate, toDate, 'createdAt');
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: {
          origin: '$origin',
          destination: '$destination',
        },
        shipmentCount: { $sum: 1 },
        deliveredShipments: {
          $sum: {
            $cond: [{ $eq: ['$currentStatus', SHIPMENT_STATUSES.DELIVERED] }, 1, 0],
          },
        },
        delayedShipments: {
          $sum: {
            $cond: [{ $eq: ['$currentStatus', SHIPMENT_STATUSES.DELAYED] }, 1, 0],
          },
        },
        onTimeDeliveries: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$currentStatus', SHIPMENT_STATUSES.DELIVERED] },
                  { $ne: ['$actualDeliveryDate', null] },
                  { $ne: ['$expectedDeliveryDate', null] },
                  { $lte: ['$actualDeliveryDate', '$expectedDeliveryDate'] },
                ],
              },
              1,
              0,
            ],
          },
        },
        deliveryHoursTotal: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$currentStatus', SHIPMENT_STATUSES.DELIVERED] },
                  { $ne: ['$actualDeliveryDate', null] },
                  { $ne: ['$dispatchDate', null] },
                ],
              },
              {
                $divide: [{ $subtract: ['$actualDeliveryDate', '$dispatchDate'] }, 1000 * 60 * 60],
              },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        origin: '$_id.origin',
        destination: '$_id.destination',
        route: { $concat: ['$_id.origin', ' → ', '$_id.destination'] },
        shipmentCount: 1,
        deliveredShipments: 1,
        delayedShipments: 1,
        onTimeDeliveries: 1,
        onTimeRate: {
          $cond: [
            { $gt: ['$deliveredShipments', 0] },
            { $round: [{ $multiply: [{ $divide: ['$onTimeDeliveries', '$deliveredShipments'] }, 100] }, 1] },
            0,
          ],
        },
        averageDeliveryHours: {
          $cond: [
            { $gt: ['$deliveredShipments', 0] },
            { $round: [{ $divide: ['$deliveryHoursTotal', '$deliveredShipments'] }, 2] },
            0,
          ],
        },
      },
    },
    { $sort: { shipmentCount: -1, route: 1 } },
    { $limit: Number(limit) || 8 },
  ];

  return Shipment.aggregate(pipeline).exec();
}

async function getWarehouseShipmentCounts(fromDate, toDate, limit = 8) {
  const { filter } = buildTrendWindow(fromDate, toDate, 'createdAt');
  const pipeline = [
    { $match: filter },
    { $group: { _id: '$currentLocation', shipmentCount: { $sum: 1 } } },
    { $project: { _id: 0, warehouse: '$_id', shipmentCount: 1 } },
    { $sort: { shipmentCount: -1, warehouse: 1 } },
    { $limit: Number(limit) || 8 },
  ];

  return Shipment.aggregate(pipeline).exec();
}

async function getDelayTrends(fromDate, toDate) {
  const { filter, startDate, endDate } = buildTrendWindow(fromDate, toDate, 'delayTimestamp');
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m',
            date: '$delayTimestamp',
            timezone: 'UTC',
          },
        },
        delayCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ];

  const rows = await DelayReport.aggregate(pipeline).exec();

  return buildMonthSeries(startDate, endDate, rows.map((row) => ({
    monthKey: row._id,
    delayCount: row.delayCount || 0,
  })), ({ label, row }) => ({
    month: label,
    delayCount: row?.delayCount || 0,
  }));
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

async function getDashboardAnalytics(options = {}) {
  const fromDate = options.fromDate;
  const toDate = options.toDate;
  const routeLimit = options.routeLimit || 8;
  const warehouseLimit = options.warehouseLimit || 8;

  const [monthlyShipmentTrends, deliveryPerformanceByRoute, warehouseShipmentCounts, delayTrends] = await Promise.all([
    getMonthlyShipmentTrends(fromDate, toDate),
    getDeliveryPerformanceByRoute(fromDate, toDate, routeLimit),
    getWarehouseShipmentCounts(fromDate, toDate, warehouseLimit),
    getDelayTrends(fromDate, toDate),
  ]);

  return {
    monthlyShipmentTrends,
    deliveryPerformanceByRoute,
    warehouseShipmentCounts,
    delayTrends,
  };
}

module.exports = {
  buildDateFilter,
  getDashboardSummary,
  getDashboardAnalytics,
  getOverview,
  getRecentShipments,
  getTotals,
  getStatusCounts,
  getDelayCategoryCounts,
  getAverageDeliveryTime,
  getMonthlyShipmentTrends,
  getDeliveryPerformanceByRoute,
  getWarehouseShipmentCounts,
  getDelayTrends,
};
