const router = require('express').Router();
const { create } = require('../controllers/warehouse-transfer.controller');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { USER_ROLES } = require('../../../constants/logistics.constants');

router.post('/', authenticateToken, authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR), create);

module.exports = router;
