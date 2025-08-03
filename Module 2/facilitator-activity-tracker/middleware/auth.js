const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided or invalid format.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and check if still active
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'isActive']
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ 
          error: 'Access denied. User not found or inactive.' 
        });
      }

      req.user = user;
      next();

    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Access denied. Token has expired.' 
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: 'Access denied. Invalid token.' 
        });
      } else {
        throw tokenError;
      }
    }

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
};

// Authorization middleware - check user roles
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user is facilitator and owns the resource
const checkFacilitatorOwnership = (resourceIdParam = 'facilitatorId') => {
  return (req, res, next) => {
    if (req.user.role === 'facilitator') {
      const resourceFacilitatorId = req.params[resourceIdParam] || req.body[resourceIdParam];
      
      if (resourceFacilitatorId && parseInt(resourceFacilitatorId) !== req.user.id) {
        return res.status(403).json({ 
          error: 'Access denied. You can only access your own resources.' 
        });
      }
    }
    next();
  };
};

// Optional authentication - sets req.user if token is valid, but doesn't require it
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'isActive']
      });

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  checkFacilitatorOwnership,
  optionalAuth
};
