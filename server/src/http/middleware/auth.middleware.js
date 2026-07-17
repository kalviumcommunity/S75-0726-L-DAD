const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
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
    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
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
