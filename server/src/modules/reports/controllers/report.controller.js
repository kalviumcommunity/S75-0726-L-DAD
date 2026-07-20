const reportService = require('../services/report.service');

function sendError(res, error) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: error.message || 'An unexpected error occurred',
  };

  if (error.details) {
    payload.details = error.details;
  }

  return res.status(statusCode).json(payload);
}

function sendValidationError(res, details) {
  return sendError(res, {
    statusCode: 400,
    message: 'Validation failed',
    details,
  });
}

async function exportShipments(req, res) {
  try {
    const { errors, normalizedInput } = reportService.validateExportQuery(req.query);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const result = await reportService.exportShipmentData(normalizedInput);

    return res.status(200)
      .attachment(result.fileName)
      .type('text/csv')
      .send(result.csv);
  } catch (error) {
    return sendError(res, error);
  }
}

async function exportDelayReports(req, res) {
  try {
    const { errors, normalizedInput } = reportService.validateExportQuery(req.query);
    if (errors.length > 0) {
      return sendValidationError(res, errors);
    }

    const result = await reportService.exportDelayReportsData(normalizedInput);

    return res.status(200)
      .attachment(result.fileName)
      .type('text/csv')
      .send(result.csv);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  exportShipments,
  exportDelayReports,
};
