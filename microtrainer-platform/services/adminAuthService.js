// =======================================================
// 🔐 ADMIN AUTHENTICATION SERVICE
// Manages admin users and JWT tokens
// =======================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret (should be in environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'microtrainer-platform-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Default admin credentials (should be changed in production)
const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  // Default password: "admin123" (CHANGE THIS IN PRODUCTION!)
  passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2b$10$YwhoeXetdLNE9c/06oYyf.UobiuZe.x/VkZfAX8BaCrJnXgyRJDzq'
};

// In-memory admin storage (in production, use database)
const admins = new Map();

// Initialize default admin
admins.set(DEFAULT_ADMIN.username, {
  username: DEFAULT_ADMIN.username,
  passwordHash: DEFAULT_ADMIN.passwordHash,
  role: 'super_admin',
  created_at: new Date()
});

// =======================================================
// 🔐 LOGIN
// =======================================================
async function login(username, password) {
  try {
    // Get admin user
    const admin = admins.get(username);
    
    if (!admin) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid username or password'
      };
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        username: admin.username,
        role: admin.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return {
      success: true,
      token,
      admin: {
        username: admin.username,
        role: admin.role
      }
    };
    
  } catch (error) {
    console.error('Login error:', error.message);
    return {
      success: false,
      message: 'Login failed'
    };
  }
}

// =======================================================
// 🔐 VERIFY TOKEN
// =======================================================
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if admin still exists
    const admin = admins.get(decoded.username);
    
    if (!admin) {
      return {
        valid: false,
        message: 'Admin user not found'
      };
    }
    
    return {
      valid: true,
      admin: {
        username: decoded.username,
        role: decoded.role
      }
    };
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        message: 'Token expired'
      };
    }
    
    return {
      valid: false,
      message: 'Invalid token'
    };
  }
}

// =======================================================
// 🔐 CREATE ADMIN USER
// =======================================================
async function createAdmin(username, password, role = 'admin') {
  try {
    // Check if admin already exists
    if (admins.has(username)) {
      return {
        success: false,
        message: 'Admin user already exists'
      };
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin
    const admin = {
      username,
      passwordHash,
      role,
      created_at: new Date()
    };
    
    admins.set(username, admin);
    
    return {
      success: true,
      admin: {
        username: admin.username,
        role: admin.role,
        created_at: admin.created_at
      }
    };
    
  } catch (error) {
    console.error('Create admin error:', error.message);
    return {
      success: false,
      message: 'Failed to create admin'
    };
  }
}

// =======================================================
// 🔐 CHANGE PASSWORD
// =======================================================
async function changePassword(username, oldPassword, newPassword) {
  try {
    const admin = admins.get(username);
    
    if (!admin) {
      return {
        success: false,
        message: 'Admin user not found'
      };
    }
    
    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, admin.passwordHash);
    
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid old password'
      };
    }
    
    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    admin.passwordHash = newPasswordHash;
    admin.password_changed_at = new Date();
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
    
  } catch (error) {
    console.error('Change password error:', error.message);
    return {
      success: false,
      message: 'Failed to change password'
    };
  }
}

// =======================================================
// 🔐 GET ALL ADMINS
// =======================================================
function getAllAdmins() {
  return Array.from(admins.values()).map(admin => ({
    username: admin.username,
    role: admin.role,
    created_at: admin.created_at
  }));
}

// =======================================================
// 🔐 DELETE ADMIN
// =======================================================
function deleteAdmin(username) {
  // Prevent deleting default admin
  if (username === DEFAULT_ADMIN.username) {
    return {
      success: false,
      message: 'Cannot delete default admin'
    };
  }
  
  if (!admins.has(username)) {
    return {
      success: false,
      message: 'Admin user not found'
    };
  }
  
  admins.delete(username);
  
  return {
    success: true,
    message: 'Admin deleted successfully'
  };
}

// =======================================================
// 🔐 HASH PASSWORD (Utility)
// =======================================================
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

module.exports = {
  login,
  verifyToken,
  createAdmin,
  changePassword,
  getAllAdmins,
  deleteAdmin,
  hashPassword
};
