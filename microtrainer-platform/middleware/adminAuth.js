// =======================================================
// 🔐 ADMIN AUTHENTICATION MIDDLEWARE
// Protects admin endpoints with JWT authentication
// =======================================================

const adminAuthService = require('../services/adminAuthService');

// =======================================================
// 🔐 REQUIRE ADMIN AUTHENTICATION
// =======================================================
function requireAdmin(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid admin token'
      });
    }
    
    // Verify token
    const verification = adminAuthService.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        message: verification.message
      });
    }
    
    // Attach admin info to request
    req.admin = verification.admin;
    
    next();
    
  } catch (error) {
    console.error('Admin auth error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

// =======================================================
// 🔐 REQUIRE SUPER ADMIN
// =======================================================
function requireSuperAdmin(req, res, next) {
  try {
    // First check if authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid admin token'
      });
    }
    
    // Verify token
    const verification = adminAuthService.verifyToken(token);
    
    if (!verification.valid) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        message: verification.message
      });
    }
    
    // Check if super admin
    if (verification.admin.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: 'Super admin access required'
      });
    }
    
    // Attach admin info to request
    req.admin = verification.admin;
    
    next();
    
  } catch (error) {
    console.error('Super admin auth error:', error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = {
  requireAdmin,
  requireSuperAdmin
};
