const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
  changeUserPassword,
  updateUserPreferences,
} = require('../services/auth.service');
const {
  validateRegisterInput,
  validateLoginInput,
  validateUpdateProfileInput,
  validatePasswordChangeInput,
  validatePreferencesInput,
} = require('../validators/auth.validators');
const logger = require('../../../utils/logger');

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

async function register(req, res) {
  try {
    const validationErrors = validateRegisterInput(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function login(req, res) {
  try {
    const validationErrors = validateLoginInput(req.body);
    if (validationErrors.length > 0) {
      logger.logAuth('LOGIN_FAILED', null, req.body.email, req.ip);
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await loginUser(req.body);
    logger.logAuth('LOGIN_SUCCESS', result.user._id, result.user.email, req.ip);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    const email = req.body?.email || null;
    logger.logAuth('LOGIN_FAILED', null, email, req.ip);
    return sendError(res, error);
  }
}

async function getMe(req, res) {
  try {
    const result = await getUserProfile(req.user?.userId);
    return res.status(200).json({
      success: true,
      message: 'User profile fetched successfully',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateProfile(req, res) {
  try {
    const validationErrors = validateUpdateProfileInput(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await updateUserProfile(req.user?.userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function changePassword(req, res) {
  try {
    const validationErrors = validatePasswordChangeInput(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await changeUserPassword(req.user?.userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updatePreferences(req, res) {
  try {
    const validationErrors = validatePreferencesInput(req.body);
    if (validationErrors.length > 0) {
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await updateUserPreferences(req.user?.userId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function logout(_req, res) {
  try {
    const result = await logoutUser();
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: result,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  updatePreferences,
  logout,
};
