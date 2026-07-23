const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { loadEnv } = require('./config');
const { connectMongo } = require('./database/connect');
const { registerRoutes } = require('./routes');

function createServer() {
  loadEnv();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  registerRoutes(app);

  // healthcheck
  app.get('/health', (_req, res) => res.status(200).json({ ok: true }));

  // connect DB once server starts
  connectMongo().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[server] Mongo connection failed:', err);
  });

  return app;
}

module.exports = { createServer };

