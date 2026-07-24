const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { loadEnv } = require('./config');
const { connectMongo } = require('./database/connect');
const { registerRoutes } = require('./routes');
const { requestLogger, errorLogger } = require('./http/middleware');
const logger = require('./utils/logger');

function createServer() {
  loadEnv();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));
  app.use(requestLogger);

  registerRoutes(app);

  // Centralized error logging
  app.use(errorLogger);

  // healthcheck
  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

  // Global error handler
  app.use((err, req, res, next) => {
    logger.logError(err, req);
    console.error('[server][global-error]', err);
    const statusCode = err.statusCode || 500;
    const payload = {
      success: false,
      message: err.message || 'An unexpected error occurred',
    };
    if (err.details) {
      payload.details = err.details;
    }
    res.status(statusCode).json(payload);
  });

  // connect DB once server starts
  connectMongo().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[server] Mongo connection failed:', err);
  });

  logger.logSystem('Server initialized successfully');

  return app;
}

module.exports = { createServer };

