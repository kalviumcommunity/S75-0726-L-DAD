const express = require('express');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const {
  create,
  getAll,
  getById,
  update,
  remove,
} = require('../controllers/shipment.controller');
const { USER_ROLES } = require('../../../constants/logistics.constants');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ANALYST), getAll);
router.get('/:id', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ANALYST), getById);
router.post('/', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR), create);
router.put('/:id', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR), update);
router.patch('/:id', authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR), update);
router.delete('/:id', authorizeRoles(USER_ROLES.MANAGER), remove);

module.exports = router;