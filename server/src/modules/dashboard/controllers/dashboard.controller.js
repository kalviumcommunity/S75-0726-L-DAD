const {
  getDashboardSummary,
  getOverview,
  getRecentShipments,
  getStatusCounts,
  getDelayCategoryCounts,
  getAverageDeliveryTime,
  getDashboardAnalytics,
  getMonthlyShipmentTrends,
  getDeliveryPerformanceByRoute,
  getWarehouseShipmentCounts,
  getDelayTrends,
  buildDateFilter,
} = require('../services/dashboard.service');

function buildAnalyticsOptions(req) {
  return {
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    routeLimit: req.query.routeLimit ? Number(req.query.routeLimit) : undefined,
    warehouseLimit: req.query.warehouseLimit ? Number(req.query.warehouseLimit) : undefined,
  };
}

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };

  if (error.details) payload.details = error.details;
  return res.status(statusCode).json(payload);
}

async function summary(req, res) {
  try {
    const recentLimit = req.query.recentLimit ? Number(req.query.recentLimit) : 10;
    const result = await getDashboardSummary({
      recentLimit,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
    });
    return res.status(200).json({ success: true, message: 'Dashboard summary fetched', data: result });
  } catch (error) {
    return sendError(res, error);
  }
}

async function analytics(req, res) {
  try {
    const data = await getDashboardAnalytics(buildAnalyticsOptions(req));
    return res.status(200).json({ success: true, message: 'Dashboard analytics fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function monthlyShipmentTrends(req, res) {
  try {
    const data = await getMonthlyShipmentTrends(req.query.fromDate, req.query.toDate);
    return res.status(200).json({ success: true, message: 'Monthly shipment trends fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deliveryPerformanceByRoute(req, res) {
  try {
    const data = await getDeliveryPerformanceByRoute(
      req.query.fromDate,
      req.query.toDate,
      req.query.routeLimit ? Number(req.query.routeLimit) : undefined,
    );
    return res.status(200).json({ success: true, message: 'Route delivery performance fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function warehouseShipmentCounts(req, res) {
  try {
    const data = await getWarehouseShipmentCounts(
      req.query.fromDate,
      req.query.toDate,
      req.query.warehouseLimit ? Number(req.query.warehouseLimit) : undefined,
    );
    return res.status(200).json({ success: true, message: 'Warehouse shipment counts fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function delayTrends(req, res) {
  try {
    const data = await getDelayTrends(req.query.fromDate, req.query.toDate);
    return res.status(200).json({ success: true, message: 'Delay trends fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function overview(req, res) {
  try {
    const data = await getOverview(req.query.fromDate, req.query.toDate);
    return res.status(200).json({ success: true, message: 'Dashboard overview fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function statusCounts(req, res) {
  try {
    const shipmentFilters = buildDateFilter(req.query.fromDate, req.query.toDate, 'createdAt');
    const data = await getStatusCounts(shipmentFilters);
    return res.status(200).json({ success: true, message: 'Dashboard status counts fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function delayBreakdown(req, res) {
  try {
    const delayFilters = buildDateFilter(req.query.fromDate, req.query.toDate, 'delayTimestamp');
    const data = await getDelayCategoryCounts(delayFilters);
    return res.status(200).json({ success: true, message: 'Dashboard delay breakdown fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function averageDeliveryTime(req, res) {
  try {
    const shipmentFilters = buildDateFilter(req.query.fromDate, req.query.toDate, 'createdAt');
    const data = await getAverageDeliveryTime(shipmentFilters);
    return res.status(200).json({ success: true, message: 'Average delivery time fetched', data });
  } catch (error) {
    return sendError(res, error);
  }
}

async function recent(req, res) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const shipments = await getRecentShipments(limit);
    return res.status(200).json({ success: true, message: 'Recent shipments fetched', data: shipments });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  summary,
  analytics,
  monthlyShipmentTrends,
  deliveryPerformanceByRoute,
  warehouseShipmentCounts,
  delayTrends,
  overview,
  statusCounts,
  delayBreakdown,
  averageDeliveryTime,
  recent,
};
