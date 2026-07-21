const ActivityLog = require('../models/ActivityLog');

async function createActivityLog(data) {
  return ActivityLog.create(data);
}

async function getActivityLogs({ page = 1, limit = 20, userId = null }) {
  const skip = (page - 1) * limit;
  const query = userId ? { user: userId } : {};

  const [activities, totalCount] = await Promise.all([
    ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'fullName email role')
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  return {
    data: activities,
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

module.exports = {
  createActivityLog,
  getActivityLogs,
};
