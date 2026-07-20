const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { exportShipments, exportDelayReports } = require('../controllers/report.controller');
const { USER_ROLES } = require('../../../constants/logistics.constants');

const router = express.Router();

router.use(authenticateToken);

router.get('/shipments/csv', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ANALYST), exportShipments);
router.get('/delays/csv', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ANALYST), exportDelayReports);

module.exports = router;
