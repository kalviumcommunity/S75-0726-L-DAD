const { getActivityHistory } = require('../services/activity-log.service');

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };

  if (error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

async function getActivities(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const userId = req.query.userId || null;

    const result = await getActivityHistory({ page, limit, userId });
    return res.status(200).json({
      success: true,
      message: 'Activity history fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  getActivities,
};
