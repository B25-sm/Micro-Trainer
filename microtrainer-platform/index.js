// =======================================================
// 🎓 MICROTRAINER CENTRAL PLATFORM
// Student Progress Tracking & Analytics Dashboard
// =======================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDatabase } = require('./config/database');
const studentTrackingService = require('./services/studentTrackingService');
const leaderboardService = require('./services/leaderboardService');
const analyticsService = require('./services/analyticsService');
const institutionService = require('./services/institutionService');
const adminAuthService = require('./services/adminAuthService');
const { requireAdmin, requireSuperAdmin } = require('./middleware/adminAuth');

const app = express();
const PORT = process.env.PORT || 6000;

// =======================================================
// 🔹 MIDDLEWARE
// =======================================================

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =======================================================
// 🔹 API KEY AUTHENTICATION MIDDLEWARE
// =======================================================

async function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  const verification = await institutionService.verifyApiKey(apiKey);
  
  if (!verification.valid) {
    return res.status(403).json({ error: 'Invalid or inactive API key' });
  }
  
  req.institution = verification;
  next();
}

// =======================================================
// 🔹 HEALTH CHECK
// =======================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MicroTrainer Central Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// =======================================================
// 🔹 ADMIN AUTHENTICATION ENDPOINTS
// =======================================================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const result = await adminAuthService.login(username, password);
    
    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }
    
    res.json({
      success: true,
      token: result.token,
      admin: result.admin
    });
    
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token (check if logged in)
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({
    valid: true,
    admin: req.admin
  });
});

// Change password
app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password required' });
    }
    
    const result = await adminAuthService.changePassword(
      req.admin.username,
      oldPassword,
      newPassword
    );
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('Change Password Error:', error.message);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Create new admin (super admin only)
app.post('/api/admin/users', requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const result = await adminAuthService.createAdmin(username, password, role);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({
      success: true,
      admin: result.admin
    });
    
  } catch (error) {
    console.error('Create Admin Error:', error.message);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// Get all admins (super admin only)
app.get('/api/admin/users', requireSuperAdmin, (req, res) => {
  try {
    const admins = adminAuthService.getAllAdmins();
    
    res.json({
      total: admins.length,
      admins
    });
    
  } catch (error) {
    console.error('Get Admins Error:', error.message);
    res.status(500).json({ error: 'Failed to get admins' });
  }
});

// Delete admin (super admin only)
app.delete('/api/admin/users/:username', requireSuperAdmin, (req, res) => {
  try {
    const { username } = req.params;
    
    const result = adminAuthService.deleteAdmin(username);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({
      success: true,
      message: result.message
    });
    
  } catch (error) {
    console.error('Delete Admin Error:', error.message);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// =======================================================
// 🔹 SYNC ENDPOINTS (Customer Backend → Central Platform)
// =======================================================

// Sync interview summary
app.post('/api/sync/interview', authenticateApiKey, async (req, res) => {
  try {
    const interviewData = req.body;
    
    // Validate required fields
    if (!interviewData.student_id || !interviewData.interview_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Add institution_id from API key
    interviewData.institution_id = req.institution.institution_id;
    
    // Record interview
    const interview = await studentTrackingService.recordInterview(interviewData);
    
    console.log(`✅ Interview synced: ${interview.interview_id} for student ${interview.student_id}`);
    
    res.json({
      success: true,
      message: 'Interview synced successfully',
      interview_id: interview.interview_id
    });
    
  } catch (error) {
    console.error('Sync Error:', error.message);
    res.status(500).json({ error: 'Failed to sync interview' });
  }
});

// Batch sync multiple interviews
app.post('/api/sync/batch', authenticateApiKey, async (req, res) => {
  try {
    const { interviews } = req.body;
    
    if (!Array.isArray(interviews)) {
      return res.status(400).json({ error: 'Interviews must be an array' });
    }
    
    const results = await Promise.all(interviews.map(async (interviewData) => {
      try {
        interviewData.institution_id = req.institution.institution_id;
        const interview = await studentTrackingService.recordInterview(interviewData);
        return { success: true, interview_id: interview.interview_id };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }));
    
    const successCount = results.filter(r => r.success).length;
    
    console.log(`✅ Batch sync: ${successCount}/${interviews.length} interviews synced`);
    
    res.json({
      success: true,
      message: `${successCount}/${interviews.length} interviews synced`,
      results
    });
    
  } catch (error) {
    console.error('Batch Sync Error:', error.message);
    res.status(500).json({ error: 'Failed to sync batch' });
  }
});

// =======================================================
// 🔹 STUDENT ENDPOINTS
// =======================================================

// Get student profile
app.get('/api/students/:student_id', authenticateApiKey, async (req, res) => {
  try {
    const { student_id } = req.params;
    const student = await studentTrackingService.getStudentProfile(student_id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    // Verify student belongs to institution
    if (student.institution_id !== req.institution.institution_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(student);
    
  } catch (error) {
    console.error('Get Student Error:', error.message);
    res.status(500).json({ error: 'Failed to get student' });
  }
});

// Get all students for institution
app.get('/api/students', authenticateApiKey, async (req, res) => {
  try {
    const students = await studentTrackingService.getStudentsByInstitution(req.institution.institution_id);
    
    res.json({
      institution_id: req.institution.institution_id,
      total_students: students.length,
      students
    });
    
  } catch (error) {
    console.error('Get Students Error:', error.message);
    res.status(500).json({ error: 'Failed to get students' });
  }
});

// =======================================================
// 🔹 LEADERBOARD ENDPOINTS
// =======================================================

// Get global leaderboard
app.get('/api/leaderboard/global', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const leaderboard = await leaderboardService.getGlobalLeaderboard(limit);
    
    res.json({
      leaderboard,
      total: leaderboard.length
    });
    
  } catch (error) {
    console.error('Leaderboard Error:', error.message);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get institution leaderboard
app.get('/api/leaderboard/institution/:institution_id', authenticateApiKey, async (req, res) => {
  try {
    const { institution_id } = req.params;
    
    // Verify access
    if (institution_id !== req.institution.institution_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const leaderboard = await leaderboardService.getInstitutionLeaderboard(institution_id, limit);
    
    res.json({
      institution_id,
      leaderboard,
      total: leaderboard.length
    });
    
  } catch (error) {
    console.error('Institution Leaderboard Error:', error.message);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get student rank
app.get('/api/leaderboard/rank/:student_id', authenticateApiKey, async (req, res) => {
  try {
    const { student_id } = req.params;
    const scope = req.query.scope || 'global';
    
    const rank = await leaderboardService.getStudentRank(student_id, scope);
    
    res.json({
      student_id,
      scope,
      ...rank
    });
    
  } catch (error) {
    console.error('Get Rank Error:', error.message);
    res.status(500).json({ error: 'Failed to get rank' });
  }
});

// Get top performers this week
app.get('/api/leaderboard/top-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topPerformers = await leaderboardService.getTopPerformersThisWeek(limit);
    
    res.json({
      period: 'This Week',
      top_performers: topPerformers
    });
    
  } catch (error) {
    console.error('Top Performers Error:', error.message);
    res.status(500).json({ error: 'Failed to get top performers' });
  }
});

// =======================================================
// 🔹 ANALYTICS ENDPOINTS
// =======================================================

// Get institution analytics
app.get('/api/analytics/institution/:institution_id', authenticateApiKey, (req, res) => {
  try {
    const { institution_id } = req.params;
    
    // Verify access
    if (institution_id !== req.institution.institution_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = analyticsService.getInstitutionAnalytics(institution_id);
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Institution Analytics Error:', error.message);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get platform analytics (admin only)
app.get('/api/analytics/platform', requireAdmin, async (req, res) => {
  try {
    const analytics = analyticsService.getPlatformAnalytics();
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Platform Analytics Error:', error.message);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Get cheating analytics
app.get('/api/analytics/cheating', authenticateApiKey, (req, res) => {
  try {
    const institution_id = req.query.institution_id || req.institution.institution_id;
    
    // Verify access
    if (institution_id !== req.institution.institution_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const analytics = analyticsService.getCheatingAnalytics(institution_id);
    
    res.json(analytics);
    
  } catch (error) {
    console.error('Cheating Analytics Error:', error.message);
    res.status(500).json({ error: 'Failed to get cheating analytics' });
  }
});

// Get performance trends
app.get('/api/analytics/trends/:student_id', authenticateApiKey, (req, res) => {
  try {
    const { student_id } = req.params;
    const trends = analyticsService.getPerformanceTrends(student_id);
    
    res.json(trends);
    
  } catch (error) {
    console.error('Performance Trends Error:', error.message);
    res.status(500).json({ error: 'Failed to get trends' });
  }
});

// =======================================================
// 🔹 PLATFORM STATS
// =======================================================

// Get platform stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await studentTrackingService.getPlatformStats();
    
    res.json(stats);
    
  } catch (error) {
    console.error('Stats Error:', error.message);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// =======================================================
// 🔹 INSTITUTION MANAGEMENT (Admin)
// =======================================================

// Create institution (admin only)
app.post('/api/admin/institutions', requireAdmin, async (req, res) => {
  try {
    const institutionData = req.body;
    
    const institution = await institutionService.createInstitution(institutionData);
    
    res.json({
      success: true,
      institution
    });
    
  } catch (error) {
    console.error('Create Institution Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all institutions (admin only)
app.get('/api/admin/institutions', requireAdmin, async (req, res) => {
  try {
    const institutions = await institutionService.getAllInstitutions();
    
    res.json({
      total: institutions.length,
      institutions
    });
    
  } catch (error) {
    console.error('Get Institutions Error:', error.message);
    res.status(500).json({ error: 'Failed to get institutions' });
  }
});

// =======================================================
// 🔹 ERROR HANDLING
// =======================================================

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// =======================================================
// 🔹 START SERVER
// =======================================================

async function startServer() {
  // Connect to MongoDB
  await connectDatabase();
  
  app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🎓 MICROTRAINER CENTRAL PLATFORM');
    console.log('='.repeat(60));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log('='.repeat(60));
  });
}

startServer();

module.exports = app;
