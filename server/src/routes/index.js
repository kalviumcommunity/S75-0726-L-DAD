const { registerHttpRoutes } = require('../http/routes');

function registerRoutes(app) {
  app.use('/api', registerHttpRoutes());
}

module.exports = { registerRoutes };


