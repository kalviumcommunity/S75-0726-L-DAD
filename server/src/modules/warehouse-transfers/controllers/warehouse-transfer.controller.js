const { createTransfer } = require('../services/warehouse-transfer.service');

function validateInput(body) {
  const errors = [];
  if (!String(body.shipmentId || '').trim()) errors.push('shipmentId is required');
  if (String(body.fromWarehouse || '').trim().length < 2) errors.push('fromWarehouse must be at least 2 characters');
  if (String(body.toWarehouse || '').trim().length < 2) errors.push('toWarehouse must be at least 2 characters');
  if (String(body.fromWarehouse || '').trim().toLowerCase() === String(body.toWarehouse || '').trim().toLowerCase()) errors.push('Destination warehouse must differ from source warehouse');
  return errors;
}

async function create(req, res) {
  try {
    const errors = validateInput(req.body || {});
    if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', details: errors });
    const transfer = await createTransfer(req.body, req.user.userId);
    return res.status(201).json({ success: true, message: 'Warehouse transfer created successfully', data: transfer });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Unable to create warehouse transfer' });
  }
}

module.exports = { create };
