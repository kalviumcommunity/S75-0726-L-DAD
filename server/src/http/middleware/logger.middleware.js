const logger = require('../../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.logRequest(req, res.statusCode, responseTime);
  });

  next();
}

function errorLogger(err, req, res, next) {
  logger.logError(err, req);
  next(err);
}

module.exports = {
  requestLogger,
  errorLogger,
};
