const router = require('express').Router();

function tryMount(routePath, basePath) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    const moduleRouter = require(routePath);
    if (moduleRouter) router.use(basePath, moduleRouter);
  } catch (err) {
    // Keep server startable even if modules are not wired yet.
    // eslint-disable-next-line no-console
    console.warn('[server][routes] Skipping mount:', routePath);
  }
}

function registerHttpRoutes() {
  // Modules
  tryMount('../../modules/auth/routes', '/auth');
  tryMount('../../modules/shipments/routes', '/shipments');
  tryMount('../../modules/warehouse-transfers/routes', '/transfers');
  tryMount('../../modules/delay-reports/routes', '/delays');
  tryMount('../../modules/reports/routes/report.routes', '/reports');
  tryMount('../../modules/activity-log/routes', '/activity');
  tryMount('../../modules/dashboard/routes/dashboard.routes', '/dashboard');

  // Health is handled in app/server.js
  return router;
}

module.exports = { registerHttpRoutes };

