const jwt = require('jsonwebtoken');
const User = require('../../modules/auth/models/User');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'ldad-dev-secret';
    const decoded = jwt.verify(token, secret);
    // Read current account state instead of trusting stale role and active claims in a JWT.
    const user = await User.findById(decoded.sub).select('email role isActive');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'This user account is inactive or no longer available',
      });
    }

    req.user = { userId: user._id.toString(), email: user.email, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
