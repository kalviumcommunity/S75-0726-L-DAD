const { listUsers, editUser, setUserActiveStatus } = require('../services/user.service');

function sendError(res, error) {
  return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'An unexpected error occurred', ...(error.details ? { details: error.details } : {}) });
}

async function getAll(req, res) {
  try {
    const result = await listUsers(req.query);
    return res.json({ success: true, message: 'Users fetched successfully', data: result.users, meta: result.meta });
  } catch (error) { return sendError(res, error); }
}

async function update(req, res) {
  try {
    const user = await editUser(req.params.id, req.body, req.user.userId);
    return res.json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) { return sendError(res, error); }
}

async function updateStatus(req, res) {
  try {
    if (typeof req.body.isActive !== 'boolean') return sendError(res, { statusCode: 400, message: 'isActive must be a boolean' });
    const user = await setUserActiveStatus(req.params.id, req.body.isActive, req.user.userId);
    return res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, data: user });
  } catch (error) { return sendError(res, error); }
}

module.exports = { getAll, update, updateStatus };
