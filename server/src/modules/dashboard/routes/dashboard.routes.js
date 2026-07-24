const router = require('express').Router();
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { USER_ROLES } = require('../../../constants/logistics.constants');
const {
  summary,
  analytics,
  monthlyShipmentTrends,
  deliveryPerformanceByRoute,
  warehouseShipmentCounts,
  delayTrends,
  overview,
  statusCounts,
  delayBreakdown,
  averageDeliveryTime,
  recent,
} = require('../controllers/dashboard.controller');

router.use(authenticateToken);
router.use(authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.COORDINATOR, USER_ROLES.ANALYST));

router.get('/summary', summary);
router.get('/analytics', analytics);
router.get('/analytics/monthly-trends', monthlyShipmentTrends);
router.get('/analytics/route-performance', deliveryPerformanceByRoute);
router.get('/analytics/warehouse-counts', warehouseShipmentCounts);
router.get('/analytics/delay-trends', delayTrends);
router.get('/overview', overview);
router.get('/status-counts', statusCounts);
router.get('/delay-breakdown', delayBreakdown);
router.get('/average-delivery-time', averageDeliveryTime);
router.get('/recent', recent);

module.exports = router;
