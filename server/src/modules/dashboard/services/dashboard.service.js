const Shipment = require('../../shipments/models/Shipment');
const DelayReport = require('../../delay-reports/models/DelayReport');
const { SHIPMENT_STATUSES } = require('../../../constants/logistics.constants');

async function getTotals() {
  const [total, delivered, delayed, inTransit] = await Promise.all([
    Shipment.countDocuments({}),
    Shipment.countDocuments({ currentStatus: SHIPMENT_STATUSES.DELIVERED }),
    Shipment.countDocuments({ currentStatus: SHIPMENT_STATUSES.DELAYED }),
    Shipment.countDocuments({ currentStatus: SHIPMENT_STATUSES.IN_TRANSIT }),
  ]);

  return { total, delivered, delayed, inTransit };
}

async function getStatusCounts() {
  const pipeline = [
    { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ];

  const rows = await Shipment.aggregate(pipeline).exec();
  return rows;
}

async function getDelayCategoryCounts() {
  const pipeline = [
    { $group: { _id: '$delayCategory', count: { $sum: 1 } } },
    { $project: { _id: 0, category: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ];

  const rows = await DelayReport.aggregate(pipeline).exec();
  return rows;
}

async function getAverageDeliveryTimeDays() {
  const pipeline = [
    { $match: { currentStatus: SHIPMENT_STATUSES.DELIVERED, actualDeliveryDate: { $ne: null } } },
    {
      $project: {
        diffMs: { $subtract: ['$actualDeliveryDate', '$dispatchDate'] },
      },
    },
    { $group: { _id: null, avgMs: { $avg: '$diffMs' } } },
  ];

  const [res] = await Shipment.aggregate(pipeline).exec();
  if (!res || res.avgMs == null) return null;
  const days = res.avgMs / (1000 * 60 * 60 * 24);
  return Number(days.toFixed(2));
}

async function getRecentShipments(limit = 10) {
  const docs = await Shipment.find({})
    .sort({ createdAt: -1 })
    .limit(Number(limit) || 10)
    .select('shipmentId origin destination currentStatus dispatchDate expectedDeliveryDate actualDeliveryDate createdAt')
    .lean()
    .exec();

  return docs;
}

async function getDashboardSummary(options = {}) {
  const recentLimit = options.recentLimit || 10;

  const [totals, statusCounts, delayCategoryCounts, avgDeliveryDays, recentShipments] = await Promise.all([
    getTotals(),
    getStatusCounts(),
    getDelayCategoryCounts(),
    getAverageDeliveryTimeDays(),
    getRecentShipments(recentLimit),
  ]);

  return {
    totals,
    statusCounts,
    delayCategoryCounts,
    averageDeliveryTimeDays: avgDeliveryDays,
    recentShipments,
  };
}

module.exports = {
  getDashboardSummary,
  getRecentShipments,
  getTotals,
  getStatusCounts,
  getDelayCategoryCounts,
  getAverageDeliveryTimeDays,
};
