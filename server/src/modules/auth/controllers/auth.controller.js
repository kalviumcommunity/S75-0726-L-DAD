const { registerUser, loginUser, getUserProfile, logoutUser } = require('../services/auth.service');
const { validateRegisterInput, validateLoginInput } = require('../validators/auth.validators');

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
      return sendError(res, {
        statusCode: 400,
        message: 'Validation failed',
        details: validationErrors,
      });
    }

    const result = await loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
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
  logout,
};
