const User = require('../models/User');

async function createUser(data) {
  return User.create(data);
}

async function findUserByEmail(email) {
  return User.findOne({ email }).lean();
}

async function findUserByEmailWithPassword(email) {
  return User.findOne({ email }).select('+password');
}

async function findUserById(userId) {
  return User.findById(userId).select('-password');
}

async function findUsers({ search, role, page, limit }) {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { fullName: { $regex: escapedSearch, $options: 'i' } },
      { email: { $regex: escapedSearch, $options: 'i' } },
    ];
  }

  const [users, totalItems] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, totalItems };
}

async function updateUserById(userId, data) {
  return User.findByIdAndUpdate(userId, data, { new: true, runValidators: true }).select('-password');
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
  findUsers,
  updateUserById,
};
