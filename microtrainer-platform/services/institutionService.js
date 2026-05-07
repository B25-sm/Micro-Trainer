// =======================================================
// 🏢 INSTITUTION SERVICE
// Manages institutions and API keys
// =======================================================

const Institution = require('../models/Institution');
const { isDbConnected } = require('../config/database');

// Fallback in-memory storage (if database not connected)
const institutions = new Map();

// =======================================================
// 🏢 CREATE INSTITUTION
// =======================================================
async function createInstitution(institutionData) {
  const { institution_id, name, email, plan } = institutionData;
  
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      // Check if institution already exists
      const existing = await Institution.findOne({ institution_id });
      if (existing) {
        throw new Error('Institution already exists');
      }
      
      const apiKey = generateApiKey();
      
      const institution = new Institution({
        institution_id,
        name,
        email,
        plan: plan || 'free',
        api_key: apiKey,
        active: true,
        usage: {
          total_students: 0,
          total_interviews: 0,
          last_sync: null
        }
      });
      
      await institution.save();
      
      return {
        institution_id,
        name,
        api_key: apiKey,
        plan: institution.plan
      };
    } catch (error) {
      if (error.message === 'Institution already exists') {
        throw error;
      }
      console.error('Database error in createInstitution:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  if (institutions.has(institution_id)) {
    throw new Error('Institution already exists');
  }
  
  const apiKey = generateApiKey();
  
  const institution = {
    institution_id,
    name,
    email,
    plan: plan || 'free',
    api_key: apiKey,
    created_at: new Date(),
    active: true,
    total_students: 0,
    total_interviews: 0,
    last_sync: null
  };
  
  institutions.set(institution_id, institution);
  
  return {
    institution_id,
    name,
    api_key: apiKey,
    plan
  };
}

// =======================================================
// 🏢 GET INSTITUTION
// =======================================================
function getInstitution(institution_id) {
  const institution = institutions.get(institution_id);
  
  if (!institution) {
    return null;
  }
  
  return {
    ...institution,
    api_key: maskApiKey(institution.api_key)
  };
}

// =======================================================
// 🏢 VERIFY API KEY
// =======================================================
async function verifyApiKey(apiKey) {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const institution = await Institution.findOne({ api_key: apiKey, active: true });
      
      if (institution) {
        return {
          valid: true,
          institution_id: institution.institution_id,
          institution_name: institution.name,
          plan: institution.plan
        };
      }
      
      return {
        valid: false,
        message: 'Invalid or inactive API key'
      };
    } catch (error) {
      console.error('Database error in verifyApiKey:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  for (const [id, institution] of institutions.entries()) {
    if (institution.api_key === apiKey && institution.active) {
      return {
        valid: true,
        institution_id: id,
        institution_name: institution.name,
        plan: institution.plan
      };
    }
  }
  
  return {
    valid: false,
    message: 'Invalid or inactive API key'
  };
}

// =======================================================
// 🏢 UPDATE INSTITUTION STATS
// =======================================================
function updateInstitutionStats(institution_id, stats) {
  const institution = institutions.get(institution_id);
  
  if (!institution) {
    return null;
  }
  
  institution.total_students = stats.total_students || institution.total_students;
  institution.total_interviews = stats.total_interviews || institution.total_interviews;
  institution.last_sync = new Date();
  
  return institution;
}

// =======================================================
// 🏢 GET ALL INSTITUTIONS
// =======================================================
async function getAllInstitutions() {
  // Use MongoDB if connected
  if (isDbConnected()) {
    try {
      const allInstitutions = await Institution.find()
        .select('institution_id name plan usage.total_students usage.total_interviews usage.last_sync active');
      
      return allInstitutions.map(inst => ({
        institution_id: inst.institution_id,
        name: inst.name,
        plan: inst.plan,
        total_students: inst.usage.total_students,
        total_interviews: inst.usage.total_interviews,
        last_sync: inst.usage.last_sync,
        active: inst.active
      }));
    } catch (error) {
      console.error('Database error in getAllInstitutions:', error.message);
      // Fall through to in-memory
    }
  }
  
  // Fallback: In-memory storage
  return Array.from(institutions.values()).map(inst => ({
    institution_id: inst.institution_id,
    name: inst.name,
    plan: inst.plan,
    total_students: inst.total_students,
    total_interviews: inst.total_interviews,
    last_sync: inst.last_sync,
    active: inst.active
  }));
}

// =======================================================
// 🏢 DEACTIVATE INSTITUTION
// =======================================================
function deactivateInstitution(institution_id) {
  const institution = institutions.get(institution_id);
  
  if (!institution) {
    return null;
  }
  
  institution.active = false;
  
  return institution;
}

// =======================================================
// 🏢 REGENERATE API KEY
// =======================================================
function regenerateApiKey(institution_id) {
  const institution = institutions.get(institution_id);
  
  if (!institution) {
    return null;
  }
  
  const newApiKey = generateApiKey();
  institution.api_key = newApiKey;
  
  return {
    institution_id,
    api_key: newApiKey
  };
}

// =======================================================
// 🏢 GENERATE API KEY
// =======================================================
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let apiKey = 'mt_';
  
  for (let i = 0; i < 32; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return apiKey;
}

// =======================================================
// 🏢 MASK API KEY
// =======================================================
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 10) return apiKey;
  
  const visible = apiKey.substring(0, 7);
  const masked = '*'.repeat(apiKey.length - 11);
  const lastFour = apiKey.substring(apiKey.length - 4);
  
  return `${visible}${masked}${lastFour}`;
}

module.exports = {
  createInstitution,
  getInstitution,
  verifyApiKey,
  updateInstitutionStats,
  getAllInstitutions,
  deactivateInstitution,
  regenerateApiKey
};
