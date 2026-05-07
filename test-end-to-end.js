// =======================================================
// 🧪 END-TO-END TEST SCRIPT
// Automated testing of complete system flow
// =======================================================

const axios = require('axios');

const CENTRAL_PLATFORM_URL = 'http://localhost:6000';
const BACKEND_URL = 'http://localhost:5000';

let adminToken = '';
let apiKey = '';
let institutionId = `TEST_${Date.now()}`; // Unique ID for each test run

// =======================================================
// 🧪 TEST 1: ADMIN LOGIN
// =======================================================
async function testAdminLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 1: Admin Login');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.post(`${CENTRAL_PLATFORM_URL}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    adminToken = response.data.token;
    
    console.log('✅ Admin login successful');
    console.log(`👤 Username: ${response.data.admin.username}`);
    console.log(`🔑 Role: ${response.data.admin.role}`);
    console.log(`🎫 Token: ${adminToken.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 TEST 2: CREATE INSTITUTION
// =======================================================
async function testCreateInstitution() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 2: Create Institution');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.post(
      `${CENTRAL_PLATFORM_URL}/api/admin/institutions`,
      {
        institution_id: institutionId,
        name: 'Test University',
        email: 'admin@test.edu',
        plan: 'free'
      },
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    
    apiKey = response.data.institution.api_key;
    
    console.log('✅ Institution created successfully');
    console.log(`🏢 Institution ID: ${response.data.institution.institution_id}`);
    console.log(`📛 Name: ${response.data.institution.name}`);
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`📦 Plan: ${response.data.institution.plan}`);
    
    return true;
  } catch (error) {
    console.error('❌ Create institution failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 TEST 3: VERIFY CENTRAL PLATFORM HEALTH
// =======================================================
async function testCentralPlatformHealth() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 3: Central Platform Health Check');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${CENTRAL_PLATFORM_URL}/health`);
    
    console.log('✅ Central platform is healthy');
    console.log(`📊 Status: ${response.data.status}`);
    console.log(`🎓 Service: ${response.data.service}`);
    console.log(`📅 Timestamp: ${response.data.timestamp}`);
    
    return true;
  } catch (error) {
    console.error('❌ Central platform health check failed:', error.message);
    console.log('⚠️ Make sure central platform is running: cd microtrainer-platform && npm start');
    return false;
  }
}

// =======================================================
// 🧪 TEST 4: VERIFY BACKEND HEALTH
// =======================================================
async function testBackendHealth() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 4: Backend Health Check');
  console.log('='.repeat(60));
  
  try {
    // Try /health first, fallback to / if not available
    let response;
    try {
      response = await axios.get(`${BACKEND_URL}/health`);
    } catch (error) {
      // Fallback to root endpoint
      response = await axios.get(`${BACKEND_URL}/`);
    }
    
    console.log('✅ Backend is healthy');
    console.log(`📊 Status: ${response.data.status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    console.log('⚠️ Make sure backend is running: cd microtrainer-backend && npm start');
    return false;
  }
}

// =======================================================
// 🧪 TEST 5: SIMULATE INTERVIEW SYNC
// =======================================================
async function testInterviewSync() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 5: Simulate Interview Sync');
  console.log('='.repeat(60));
  
  try {
    const mockInterview = {
      student_id: `STU_${institutionId}_001`, // Use institution-specific student ID
      interview_id: `INT_${Date.now()}`,
      date: new Date().toISOString(),
      subject: 'JavaScript',
      scores: {
        technical: 85,
        communication: 78,
        confidence: 82,
        problem_solving: 80,
        overall: 81.25
      },
      anti_cheat: {
        warnings: 0,
        suspicion_score: 10,
        cheating_risk: 'low',
        flagged: false
      },
      strengths: ['React', 'JavaScript', 'APIs'],
      weak_topics: ['System Design', 'Algorithms'],
      progress: {
        compared_to_previous: '+5%',
        consistency_score: 85,
        interview_count: 1
      },
      duration_minutes: 45,
      questions_answered: 5,
      completion_rate: 100
    };
    
    const response = await axios.post(
      `${CENTRAL_PLATFORM_URL}/api/sync/interview`,
      mockInterview,
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    );
    
    console.log('✅ Interview synced successfully');
    console.log(`🎓 Student ID: ${mockInterview.student_id}`);
    console.log(`📝 Interview ID: ${mockInterview.interview_id}`);
    console.log(`📊 Overall Score: ${mockInterview.scores.overall}`);
    console.log(`🔒 Cheating Risk: ${mockInterview.anti_cheat.cheating_risk}`);
    
    return true;
  } catch (error) {
    console.error('❌ Interview sync failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 TEST 6: GET STUDENT PROFILE
// =======================================================
async function testGetStudentProfile() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 6: Get Student Profile');
  console.log('='.repeat(60));
  
  try {
    const studentId = `STU_${institutionId}_001`; // Use the same student ID from sync
    
    const response = await axios.get(
      `${CENTRAL_PLATFORM_URL}/api/students/${studentId}`,
      {
        headers: {
          'X-API-Key': apiKey
        }
      }
    );
    
    console.log('✅ Student profile retrieved');
    console.log(`🎓 Student ID: ${response.data.student_id}`);
    console.log(`📊 Total Interviews: ${response.data.total_interviews}`);
    console.log(`📈 Average Score: ${response.data.average_score.toFixed(2)}`);
    console.log(`💪 Strengths: ${response.data.strengths.join(', ')}`);
    console.log(`📉 Weak Topics: ${response.data.weak_topics.join(', ')}`);
    console.log(`🔒 Cheating Incidents: ${response.data.cheating_incidents}`);
    
    return true;
  } catch (error) {
    console.error('❌ Get student profile failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 TEST 7: GET PLATFORM STATS
// =======================================================
async function testGetPlatformStats() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 7: Get Platform Statistics');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${CENTRAL_PLATFORM_URL}/api/stats`);
    
    console.log('✅ Platform stats retrieved');
    console.log(`👥 Total Students: ${response.data.total_students}`);
    console.log(`📝 Total Interviews: ${response.data.total_interviews}`);
    console.log(`🏢 Total Institutions: ${response.data.total_institutions}`);
    console.log(`📊 Platform Average: ${response.data.platform_average_score}`);
    console.log(`🚨 Flagged Students: ${response.data.flagged_students}`);
    console.log(`🟢 Active Today: ${response.data.active_students_today}`);
    
    return true;
  } catch (error) {
    console.error('❌ Get platform stats failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 TEST 8: GET GLOBAL LEADERBOARD
// =======================================================
async function testGetLeaderboard() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 8: Get Global Leaderboard');
  console.log('='.repeat(60));
  
  try {
    const response = await axios.get(`${CENTRAL_PLATFORM_URL}/api/leaderboard/global?limit=5`);
    
    console.log('✅ Leaderboard retrieved');
    console.log(`📊 Total Students: ${response.data.total}`);
    
    if (response.data.leaderboard.length > 0) {
      console.log('\n🏆 Top Students:');
      response.data.leaderboard.slice(0, 5).forEach((student, index) => {
        console.log(`${student.badge} #${student.rank} - ${student.student_id} - Score: ${student.average_score} (${student.total_interviews} interviews)`);
      });
    } else {
      console.log('📋 No students in leaderboard yet');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Get leaderboard failed:', error.response?.data || error.message);
    return false;
  }
}

// =======================================================
// 🧪 RUN ALL TESTS
// =======================================================
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 MICROTRAINER END-TO-END TEST SUITE');
  console.log('='.repeat(60));
  console.log('Testing complete system flow...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 8
  };
  
  // Test 1: Central Platform Health
  if (await testCentralPlatformHealth()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n❌ Central platform is not running. Please start it first.');
    console.log('Run: cd microtrainer-platform && npm start');
    return;
  }
  
  // Test 2: Backend Health
  if (await testBackendHealth()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n⚠️ Backend health check failed (non-critical - using fallback).');
  }
  
  // Test 3: Admin Login
  if (await testAdminLogin()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n❌ Admin login failed. Cannot continue with remaining tests.');
    return;
  }
  
  // Test 4: Create Institution
  if (await testCreateInstitution()) {
    results.passed++;
  } else {
    results.failed++;
    console.log('\n❌ Create institution failed. Cannot continue with remaining tests.');
    return;
  }
  
  // Test 5: Interview Sync
  if (await testInterviewSync()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 6: Get Student Profile
  if (await testGetStudentProfile()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 7: Platform Stats
  if (await testGetPlatformStats()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 8: Leaderboard
  if (await testGetLeaderboard()) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Failed: ${results.failed}/${results.total}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is working perfectly! 🚀');
    console.log('\n📋 CREDENTIALS SAVED:');
    console.log(`Admin Token: ${adminToken}`);
    console.log(`API Key: ${apiKey}`);
    console.log(`Institution ID: ${institutionId}`);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the errors above.');
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});
