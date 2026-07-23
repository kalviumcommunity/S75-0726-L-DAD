const { DELAY_CATEGORIES } = require('../../../constants/logistics.constants');
const { createDelayReport } = require('../services/delay-report.service');

async function create(req, res) {
  const body = req.body || {};
  const errors = [];
  if (!String(body.shipmentId || '').trim()) errors.push('shipmentId is required');
  if (String(body.delayReason || '').trim().length < 3) errors.push('delayReason must be at least 3 characters');
  if (!Object.values(DELAY_CATEGORIES).includes(body.delayCategory)) errors.push('delayCategory is invalid');
  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', details: errors });

  try {
    const delayReport = await createDelayReport(body, req.user.userId);
    return res.status(201).json({ success: true, message: 'Delay report created successfully', data: delayReport });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to create delay report' });
  }
}

module.exports = { create };
