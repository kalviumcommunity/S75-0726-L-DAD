const AuditLog = require('../models/AuditLog');

async function createActivityLog(data) {
  return AuditLog.create(data);
}

async function getActivityLogs({ page = 1, limit = 20, userId = null, action = null, sortBy = 'createdAt', sortOrder = 'desc' }) {
  const skip = (page - 1) * limit;
  const query = {};
  if (userId) query.user = userId;
  if (action) query.action = action;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1, _id: -1 };

  const [activities, totalCount] = await Promise.all([
    AuditLog.find(query)
      .sort(sort)
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
