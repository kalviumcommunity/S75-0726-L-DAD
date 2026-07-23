const fs = require('fs');
const path = require('path');
const { loadEnv } = require('../config');

loadEnv();

const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function logToFile(fileName, message) {
  ensureLogDir();
  const filePath = path.join(LOG_DIR, fileName);
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(filePath, line);
}

module.exports = {
  logRequest: (req, statusCode, responseTime) => {
    const message = `${req.method} ${req.originalUrl} ${statusCode} ${responseTime}ms - ${req.ip}`;
    logToFile('requests.log', message);
  },

  logError: (err, req = null) => {
    const context = req ? `${req.method} ${req.originalUrl}` : 'System';
    const message = `ERROR ${context} - ${err.message}`;
    logToFile('errors.log', message);
    if (err.stack) {
      logToFile('errors.log', `Stack: ${err.stack}`);
    }
  },

  logAuth: (event, userId, email, ip) => {
    const message = `AUTH ${event} - userId: ${userId} email: ${email} ip: ${ip}`;
    logToFile('auth.log', message);
  },

  logShipment: (event, userId, shipmentId, details = '') => {
    const message = `SHIPMENT ${event} - userId: ${userId} shipmentId: ${shipmentId} ${details}`.trim();
    logToFile('shipments.log', message);
  },

  logSystem: (message) => {
    logToFile('system.log', message);
  },

  getLogDir: () => LOG_DIR,
};
