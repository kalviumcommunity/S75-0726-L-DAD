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

module.exports = {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  findUserById,
};
