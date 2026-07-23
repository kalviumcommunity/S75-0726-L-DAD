const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeRoles } = require('../../../http/middleware');
const { USER_ROLES } = require('../../../constants/logistics.constants');
const logger = require('../../../utils/logger');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles(USER_ROLES.MANAGER));

function readLogFile(fileName) {
  const filePath = path.join(logger.getLogDir(), fileName);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(Boolean).slice(-100);
}

router.get('/logs/requests', (req, res) => {
  res.json({ success: true, data: readLogFile('requests.log') });
});

router.get('/logs/errors', (req, res) => {
  res.json({ success: true, data: readLogFile('errors.log') });
});

router.get('/logs/auth', (req, res) => {
  res.json({ success: true, data: readLogFile('auth.log') });
});

router.get('/logs/shipments', (req, res) => {
  res.json({ success: true, data: readLogFile('shipments.log') });
});

router.get('/logs/system', (req, res) => {
  res.json({ success: true, data: readLogFile('system.log') });
});

module.exports = router;
