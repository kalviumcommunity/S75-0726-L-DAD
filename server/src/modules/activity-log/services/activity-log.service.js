const ActivityLogRepository = require('../repositories/activity-log.repository');

async function logActivity(type, userId, metadata = {}) {
  return ActivityLogRepository.createActivityLog({
    type,
    user: userId,
    metadata,
  });
}

async function getActivityHistory({ page = 1, limit = 20, userId = null }) {
  return ActivityLogRepository.getActivityLogs({ page, limit, userId });
}

module.exports = {
  logActivity,
  getActivityHistory,
};
