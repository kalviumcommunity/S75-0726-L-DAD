const { authenticateToken, authorizeRoles } = require('./auth.middleware');

module.exports = {
  authenticateToken,
  authorizeRoles,
};

