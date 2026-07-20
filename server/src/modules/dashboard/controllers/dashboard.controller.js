const { getDashboardSummary, getRecentShipments } = require('../services/dashboard.service');

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
    const result = await getDashboardSummary({ recentLimit });
    return res.status(200).json({ success: true, message: 'Dashboard summary fetched', data: result });
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

module.exports = { summary, recent };
