const express = require('express');
const { getActivities } = require('../controllers/activity-log.controller');
const { authenticateToken } = require('../../../http/middleware');

const router = express.Router();

router.get('/', authenticateToken, getActivities);

module.exports = router;
