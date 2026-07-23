const ActivityLogRepository = require('../repositories/activity-log.repository');

async function logActivity(action, userId, { entityType = null, entityId = null, ...metadata } = {}) {
  return ActivityLogRepository.createActivityLog({
    action,
    user: userId,
    entityType,
    entityId: entityId == null ? null : String(entityId),
    metadata,
  });
}

async function getActivityHistory({ page = 1, limit = 20, userId = null, action = null, sortBy = 'createdAt', sortOrder = 'desc' }) {
  return ActivityLogRepository.getActivityLogs({ page, limit, userId, action, sortBy, sortOrder });
}

module.exports = {
  logActivity,
  getActivityHistory,
};
