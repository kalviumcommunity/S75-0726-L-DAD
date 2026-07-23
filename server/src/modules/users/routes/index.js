const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { USER_ROLES } = require('../../../constants/logistics.constants');
const { getAll, update, updateStatus } = require('../controllers/user.controller');

const router = express.Router();
router.use(authenticateToken, authorizeRoles(USER_ROLES.MANAGER));
router.get('/', getAll);
router.patch('/:id', update);
router.patch('/:id/status', updateStatus);
module.exports = router;
