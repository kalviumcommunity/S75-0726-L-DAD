const router = require('express').Router();
const {
  summary,
  analytics,
  overview,
  statusCounts,
  delayBreakdown,
  averageDeliveryTime,
  recent,
} = require('../controllers/dashboard.controller');

router.get('/summary', summary);
router.get('/analytics', analytics);
router.get('/overview', overview);
router.get('/status-counts', statusCounts);
router.get('/delay-breakdown', delayBreakdown);
router.get('/average-delivery-time', averageDeliveryTime);
router.get('/recent', recent);

module.exports = router;
