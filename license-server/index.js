// =======================================================
// 🔒 MICROTRAINER LICENSE SERVER
// Validates license keys and tracks deployments
// Deploy this on YOUR Render account
// =======================================================

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending-setups.json');
const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const GITHUB_REPO_URL = process.env.GITHUB_REPO_URL || 'https://github.com/yourusername/microtrainer';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@microtrainer.com';
const FROM_NAME = process.env.FROM_NAME || 'MicroTrainer';
const SETUP_TOKEN_TTL_MINUTES = Number(process.env.SETUP_TOKEN_TTL_MINUTES || 30);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/setup', express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// =======================================================
// 📊 APPROVED STUDENTS DATABASE
// Add students here after they request a license
// =======================================================
const APPROVED_STUDENTS = [
  {
    email: 'student1@example.com',
    name: 'Student One',
    license_key: 'student1@example.com:abc123def456',
    issued_at: '2026-01-01',
    expires_at: null, // null = never expires
    deployment_url: 'student1-microtrainer.onrender.com',
    status: 'active', // active, suspended, expired
  },
  {
    email: 'student2@example.com',
    name: 'Student Two',
    license_key: 'student2@example.com:xyz789ghi012',
    issued_at: '2026-01-02',
    expires_at: null,
    deployment_url: 'student2-microtrainer.onrender.com',
    status: 'active',
  },
  // Add more students here...
];

const DISCONNECTED_AFTER_DAYS = Number(process.env.DISCONNECTED_AFTER_DAYS || 3);

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`❌ Failed reading ${file}:`, error.message);
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadLicenses() {
  return readJson(LICENSES_FILE, []);
}

function saveLicenses(licenses) {
  writeJson(LICENSES_FILE, licenses);
}

function loadPendingSetups() {
  return readJson(PENDING_FILE, {});
}

function savePendingSetups(pending) {
  writeJson(PENDING_FILE, pending);
}

function getAllStudents() {
  const generated = loadLicenses();
  const byKey = new Map();
  [...APPROVED_STUDENTS, ...generated].forEach((student) => {
    byKey.set(`${student.email}::${student.license_key}`, student);
  });
  return Array.from(byKey.values());
}

function findStudent(email, licenseKey) {
  return getAllStudents().find(
    (s) => s.license_key === licenseKey && s.email === email
  );
}

function upsertGeneratedLicense(record) {
  const licenses = loadLicenses();
  const index = licenses.findIndex((s) => s.email === record.email);
  if (index >= 0) {
    licenses[index] = { ...licenses[index], ...record };
  } else {
    licenses.push(record);
  }
  saveLicenses(licenses);
  return index >= 0 ? licenses[index] : record;
}

function updateStudentRecord(student) {
  const licenses = loadLicenses();
  const index = licenses.findIndex(
    (s) => s.email === student.email && s.license_key === student.license_key
  );
  if (index >= 0) {
    licenses[index] = student;
    saveLicenses(licenses);
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isLikelyGroqKey(groqKey) {
  return /^gsk_[A-Za-z0-9_-]{20,}$/.test(String(groqKey || '').trim());
}

function buildRenderDeployUrl({ email, licenseKey, groqKey }) {
  const params = new URLSearchParams();
  params.set('repo', GITHUB_REPO_URL);
  params.set('env[LICENSE_KEY]', licenseKey);
  params.set('env[STUDENT_EMAIL]', email);
  params.set('env[LICENSE_SERVER_URL]', PUBLIC_BASE_URL);
  params.set('env[GROQ_API_KEY]', groqKey);
  params.set('env[OFFICIAL_SYNC_REQUIRED]', '1');
  params.set('env[OFFICIAL_SYNC_STALE_HOURS]', '72');
  return `https://render.com/deploy?${params.toString()}`;
}

async function sendEmail({ to, subject, text, html }) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    });

    return { sent: true, mode: 'smtp' };
  }

  console.log('📧 SMTP email provider missing. Email content printed instead.');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log(text);
  return { sent: false, mode: 'console' };
}

function cleanupPendingSetups() {
  const pending = loadPendingSetups();
  const now = Date.now();
  let changed = false;

  Object.entries(pending).forEach(([tokenHash, setup]) => {
    if (new Date(setup.expires_at).getTime() <= now) {
      delete pending[tokenHash];
      changed = true;
    }
  });

  if (changed) savePendingSetups(pending);
}

function getConnectionStatus(student) {
  if (!student.last_sync_at) return 'disconnected';

  const lastSyncTime = new Date(student.last_sync_at).getTime();
  if (!Number.isFinite(lastSyncTime)) return 'disconnected';

  const ageMs = Date.now() - lastSyncTime;
  const staleMs = DISCONNECTED_AFTER_DAYS * 24 * 60 * 60 * 1000;
  return ageMs <= staleMs ? 'active' : 'disconnected';
}

// =======================================================
// 🔹 GENERATE LICENSE KEY (Helper function)
// =======================================================
function generateLicenseKey(email) {
  const hash = crypto
    .createHash('sha256')
    .update(`${email}:microtrainer:2026`)
    .digest('hex')
    .substring(0, 16);
  
  return `${email}:${hash}`;
}

// =======================================================
// 🔹 VALIDATE LICENSE ENDPOINT
// =======================================================
app.post('/api/validate', (req, res) => {
  try {
    const { license_key, deployment_url, student_email, timestamp } = req.body;
    
    console.log('🔍 License validation request:', {
      email: student_email,
      deployment: deployment_url,
      timestamp: new Date(timestamp).toISOString(),
    });
    
    // Check if license key exists
    if (!license_key) {
      return res.status(400).json({
        valid: false,
        message: 'License key is required',
      });
    }
    
    // Find student in approved list
    const student = findStudent(student_email, license_key);
    
    if (!student) {
      console.log('❌ License not found:', student_email);
      return res.status(403).json({
        valid: false,
        message: 'Invalid license key or email',
        contact: '[your-email@example.com]',
      });
    }
    
    // Check if license is active
    if (student.status !== 'active') {
      console.log('❌ License not active:', student_email, student.status);
      return res.status(403).json({
        valid: false,
        message: `License is ${student.status}`,
        contact: '[your-email@example.com]',
      });
    }
    
    // Check if license has expired
    if (student.expires_at) {
      const expiryDate = new Date(student.expires_at);
      if (expiryDate < new Date()) {
        console.log('❌ License expired:', student_email);
        return res.status(403).json({
          valid: false,
          message: 'License has expired',
          expired_at: student.expires_at,
          contact: '[your-email@example.com]',
        });
      }
    }
    
    // Check deployment URL (optional - can be used to restrict to specific URLs)
    // if (student.deployment_url && deployment_url !== student.deployment_url) {
    //   console.log('⚠️  Deployment URL mismatch:', deployment_url, 'expected:', student.deployment_url);
    //   // You can choose to allow or deny here
    // }
    
    // License is valid!
    console.log('✅ License validated:', student_email);
    
    res.json({
      valid: true,
      student_name: student.name,
      student_email: student.email,
      issued_at: student.issued_at,
      expires_at: student.expires_at,
      last_sync_at: student.last_sync_at || null,
      connection_status: getConnectionStatus(student),
      message: 'License validated successfully',
    });
    
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({
      valid: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// =======================================================
// 🔹 SYNC HEARTBEAT ENDPOINT
// =======================================================
app.post('/api/sync/heartbeat', (req, res) => {
  try {
    const {
      license_key,
      student_email,
      deployment_url,
      student_id,
      channel,
      timestamp,
    } = req.body;

    const student = findStudent(student_email, license_key);

    if (!student) {
      return res.status(403).json({
        success: false,
        message: 'Invalid license key or email',
      });
    }

    if (student.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `License is ${student.status}`,
      });
    }

    student.last_sync_at = new Date(timestamp || Date.now()).toISOString();
    student.last_sync_channel = channel || 'unknown';
    student.student_id = student_id || student.student_id || null;
    student.deployment_url = deployment_url || student.deployment_url;
    updateStudentRecord(student);

    console.log('✅ Sync heartbeat:', {
      email: student.email,
      channel: student.last_sync_channel,
      last_sync_at: student.last_sync_at,
    });

    res.json({
      success: true,
      email: student.email,
      last_sync_at: student.last_sync_at,
      connection_status: getConnectionStatus(student),
    });
  } catch (error) {
    console.error('❌ Sync heartbeat error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// =======================================================
// 🔹 PUBLIC HYBRID SETUP FLOW
// =======================================================
app.get('/api/public/setup-config', (req, res) => {
  res.json({
    githubRepoUrl: GITHUB_REPO_URL,
    licenseServerUrl: PUBLIC_BASE_URL,
    emailVerification: true,
    deployProvider: 'render',
  });
});

app.post('/api/public/start-setup', async (req, res) => {
  try {
    cleanupPendingSetups();

    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const groqKey = String(req.body.groqKey || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (!isLikelyGroqKey(groqKey)) {
      return res.status(400).json({
        error: 'Enter a valid Groq API key. It should start with gsk_.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + SETUP_TOKEN_TTL_MINUTES * 60 * 1000
    ).toISOString();

    const pending = loadPendingSetups();
    pending[tokenHash] = {
      name,
      email,
      groqKey,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };
    savePendingSetups(pending);

    const verifyUrl = `${PUBLIC_BASE_URL}/api/public/complete-setup?token=${token}`;
    const subject = 'Your MicroTrainer secure deploy link';
    const text = `Hi ${name},

Click this secure link to verify your email and open your one-click Render deployment:

${verifyUrl}

This link expires in ${SETUP_TOKEN_TTL_MINUTES} minutes.

MicroTrainer will create your license automatically and prefill Render with your license, email, and Groq key.
`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>MicroTrainer setup is ready</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to verify your email and open Render with everything prefilled.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">
            Verify Email & Deploy MicroTrainer
          </a>
        </p>
        <p>This link expires in ${SETUP_TOKEN_TTL_MINUTES} minutes.</p>
        <p style="color:#6b7280;font-size:13px">If the button does not work, paste this URL into your browser:<br>${verifyUrl}</p>
      </div>
    `;

    const emailResult = await sendEmail({ to: email, subject, text, html });

    res.json({
      success: true,
      message:
        emailResult.mode === 'console'
          ? 'Setup link generated. Check the license server console because email is not configured.'
          : 'Secure setup link sent. Check your email.',
      email,
      expiresAt,
      emailMode: emailResult.mode,
      devVerifyUrl: emailResult.mode === 'console' ? verifyUrl : undefined,
    });
  } catch (error) {
    console.error('❌ Public setup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start setup',
      message: error.message,
    });
  }
});

app.get('/api/public/complete-setup', (req, res) => {
  try {
    cleanupPendingSetups();

    const token = String(req.query.token || '');
    if (!token) {
      return res.status(400).send('Setup token is required.');
    }

    const tokenHash = hashToken(token);
    const pending = loadPendingSetups();
    const setup = pending[tokenHash];

    if (!setup) {
      return res.status(400).send('This setup link is invalid or expired.');
    }

    if (new Date(setup.expires_at).getTime() <= Date.now()) {
      delete pending[tokenHash];
      savePendingSetups(pending);
      return res.status(400).send('This setup link has expired. Please start again.');
    }

    const license_key = generateLicenseKey(setup.email);
    const student = upsertGeneratedLicense({
      email: setup.email,
      name: setup.name,
      license_key,
      issued_at: new Date().toISOString(),
      expires_at: null,
      deployment_url: null,
      status: 'active',
      source: 'public_verified_setup',
    });

    delete pending[tokenHash];
    savePendingSetups(pending);

    console.log('✅ Public verified license generated:', {
      email: student.email,
      license: student.license_key,
    });

    return res.redirect(
      buildRenderDeployUrl({
        email: student.email,
        licenseKey: student.license_key,
        groqKey: setup.groqKey,
      })
    );
  } catch (error) {
    console.error('❌ Complete setup error:', error);
    res.status(500).send('Failed to complete setup. Please try again.');
  }
});

// =======================================================
// 🔹 GENERATE LICENSE KEY ENDPOINT (Admin only)
// =======================================================
app.post('/api/admin/generate', (req, res) => {
  try {
    const { admin_key, email, name } = req.body;
    
    // Check admin key
    if (admin_key !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        error: 'Invalid admin key',
      });
    }
    
    // Generate license key
    const license_key = generateLicenseKey(email);
    
    console.log('🔑 Generated license key for:', email);
    
    res.json({
      success: true,
      email: email,
      name: name,
      license_key: license_key,
      message: 'Add this to APPROVED_STUDENTS array',
    });
    
  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// =======================================================
// 🔹 LIST ACTIVE LICENSES (Admin only)
// =======================================================
app.get('/api/admin/licenses', (req, res) => {
  try {
    const { admin_key } = req.query;
    
    // Check admin key
    if (admin_key !== process.env.ADMIN_KEY) {
      return res.status(403).json({
        error: 'Invalid admin key',
      });
    }
    
    // Return list of active licenses
    const licenses = getAllStudents().map(s => ({
      email: s.email,
      name: s.name,
      status: s.status,
      issued_at: s.issued_at,
      expires_at: s.expires_at,
      deployment_url: s.deployment_url,
      last_sync_at: s.last_sync_at || null,
      connection_status: getConnectionStatus(s),
    }));
    
    res.json({
      total: licenses.length,
      active: licenses.filter(l => l.status === 'active').length,
      licenses: licenses,
    });
    
  } catch (error) {
    console.error('❌ List error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// =======================================================
// 🔹 HEALTH CHECK
// =======================================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MicroTrainer License Server',
    timestamp: new Date().toISOString(),
    total_licenses: getAllStudents().length,
    active_licenses: getAllStudents().filter(s => s.status === 'active').length,
  });
});

// =======================================================
// 🔹 ROOT ENDPOINT
// =======================================================
app.get('/', (req, res) => {
  res.json({
    service: 'MicroTrainer License Server',
    version: '1.0.0',
    endpoints: {
      setup: 'GET /setup',
      setupConfig: 'GET /api/public/setup-config',
      startSetup: 'POST /api/public/start-setup',
      completeSetup: 'GET /api/public/complete-setup?token=...',
      validate: 'POST /api/validate',
      syncHeartbeat: 'POST /api/sync/heartbeat',
      generate: 'POST /api/admin/generate (admin only)',
      list: 'GET /api/admin/licenses (admin only)',
      health: 'GET /health',
    },
    contact: '[your-email@example.com]',
  });
});

// =======================================================
// 🚀 START SERVER
// =======================================================
app.listen(PORT, () => {
  console.log('================================================================================');
  console.log('🔒 MICROTRAINER LICENSE SERVER');
  console.log('================================================================================');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Public setup: ${PUBLIC_BASE_URL}/setup`);
  console.log(`📊 Total licenses: ${getAllStudents().length}`);
  console.log(`✅ Active licenses: ${getAllStudents().filter(s => s.status === 'active').length}`);
  console.log('================================================================================');
});
