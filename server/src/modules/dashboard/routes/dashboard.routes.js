const router = require('express').Router();
const { summary, recent } = require('../controllers/dashboard.controller');

router.get('/summary', summary);
router.get('/recent', recent);

module.exports = router;
