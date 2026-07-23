const { getActivityHistory } = require('../services/activity-log.service');
const { ACTIVITY_TYPES } = require('../../../constants/logistics.constants');

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
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const userId = req.query.userId || null;
    const action = req.query.action || null;
    const sortBy = ['createdAt', 'action'].includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

    if (action && !Object.values(ACTIVITY_TYPES).includes(action)) {
      return sendError(res, { statusCode: 400, message: 'Invalid audit log action' });
    }

    const result = await getActivityHistory({ page, limit, userId, action, sortBy, sortOrder });
    return res.status(200).json({
      success: true,
      message: 'Audit logs fetched successfully',
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
