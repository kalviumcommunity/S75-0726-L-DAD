const express = require('express');
const { getActivities } = require('../controllers/activity-log.controller');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { USER_ROLES } = require('../../../constants/logistics.constants');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ANALYST), getActivities);

module.exports = router;
