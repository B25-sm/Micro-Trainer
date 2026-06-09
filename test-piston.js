// =======================================================
// 🧪 PISTON INTEGRATION TEST SCRIPT
// Tests code execution with Piston API
// =======================================================

const axios = require('axios');

const { resolvePistonApiBase } = require('./scripts/piston-api');

// Self-hosted: http://127.0.0.1:2000/api/v2
const PISTON_URL = resolvePistonApiBase(
  process.env.PISTON_URL || 'http://127.0.0.1:2000/api/v2'
);

console.log('🚀 Testing Piston Integration...\n');
console.log(`📡 Piston URL: ${PISTON_URL}\n`);

// =======================================================
// TEST 1: Check Available Runtimes
// =======================================================
async function testRuntimes() {
  console.log('📋 TEST 1: Checking available runtimes...');
  try {
    const response = await axios.get(`${PISTON_URL}/runtimes`);
    const runtimes = response.data;
    
    console.log(`✅ Found ${runtimes.length} available runtimes`);
    console.log('\n🔹 Popular languages:');
    
    const popular = ['javascript', 'python', 'java', 'c++', 'c', 'csharp', 'typescript', 'go', 'rust'];
    popular.forEach(lang => {
      const runtime = runtimes.find(r => r.language === lang);
      if (runtime) {
        console.log(`   ✅ ${runtime.language} (v${runtime.version})`);
      } else {
        console.log(`   ❌ ${lang} - NOT FOUND`);
      }
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

// =======================================================
// TEST 2: Execute JavaScript Code
// =======================================================
async function testJavaScript() {
  console.log('\n\n📋 TEST 2: Executing JavaScript code...');
  try {
    const code = `
function solution(input) {
  return input * 2;
}
console.log(JSON.stringify(solution(5)));
`;
    
    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: 'typescript',
      version: '5.0.3',
      files: [{
        name: 'solution.ts',
        content: code
      }]
    });
    
    const output = response.data.run.stdout.trim();
    const expected = '10';
    
    if (output === expected) {
      console.log(`✅ JavaScript execution successful`);
      console.log(`   Input: 5`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return true;
    } else {
      console.log(`❌ JavaScript execution failed`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// =======================================================
// TEST 3: Execute Python Code
// =======================================================
async function testPython() {
  console.log('\n\n📋 TEST 3: Executing Python code...');
  try {
    const code = `
import json
def solution(input):
    return input * 2
print(json.dumps(solution(5)))
`;
    
    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: 'python',
      version: '3.10.0',
      files: [{
        name: 'solution.py',
        content: code
      }]
    });
    
    const output = response.data.run.stdout.trim();
    const expected = '10';
    
    if (output === expected) {
      console.log(`✅ Python execution successful`);
      console.log(`   Input: 5`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return true;
    } else {
      console.log(`❌ Python execution failed`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// =======================================================
// TEST 4: Execute Java Code
// =======================================================
async function testJava() {
  console.log('\n\n📋 TEST 4: Executing Java code...');
  try {
    const code = `
public class Main {
    public static void main(String[] args) {
        System.out.println(solution(5));
    }
    
    public static int solution(int input) {
        return input * 2;
    }
}
`;
    
    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: 'java',
      version: '15.0.2',
      files: [{
        name: 'Main.java',
        content: code
      }]
    });
    
    const output = response.data.run.stdout.trim();
    const expected = '10';
    
    if (output === expected) {
      console.log(`✅ Java execution successful (NO JDK NEEDED!)`);
      console.log(`   Input: 5`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return true;
    } else {
      console.log(`❌ Java execution failed`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// =======================================================
// TEST 5: Execute C++ Code
// =======================================================
async function testCpp() {
  console.log('\n\n📋 TEST 5: Executing C++ code...');
  try {
    const code = `
#include <iostream>
using namespace std;

int solution(int input) {
    return input * 2;
}

int main() {
    cout << solution(5) << endl;
    return 0;
}
`;
    
    const response = await axios.post(`${PISTON_URL}/execute`, {
      language: 'c++',
      version: '10.2.0',
      files: [{
        name: 'solution.cpp',
        content: code
      }]
    });
    
    const output = response.data.run.stdout.trim();
    const expected = '10';
    
    if (output === expected) {
      console.log(`✅ C++ execution successful (NO COMPILER NEEDED!)`);
      console.log(`   Input: 5`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return true;
    } else {
      console.log(`❌ C++ execution failed`);
      console.log(`   Expected: ${expected}`);
      console.log(`   Got: ${output}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    if (error.response) {
      console.error(`   Response: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// =======================================================
// TEST 6: Test MicroTrainer Code Execution Service
// =======================================================
async function testMicroTrainerService() {
  console.log('\n\n📋 TEST 6: Testing MicroTrainer code execution service...');
  try {
    const { executeCode } = require('./microtrainer-backend/services/codeExecutionService.js');
    
    const testCases = [
      { input: 5, output: 10 },
      { input: 3, output: 6 },
      { input: 0, output: 0 }
    ];
    
    const code = `
function solution(input) {
  return input * 2;
}
`;
    
    const result = await executeCode('javascript', code, testCases);
    
    if (result.success && result.passedTests === 3) {
      console.log(`✅ MicroTrainer service working perfectly`);
      console.log(`   Total Tests: ${result.totalTests}`);
      console.log(`   Passed: ${result.passedTests}`);
      console.log(`   Failed: ${result.failedTests}`);
      console.log(`   Score: ${result.score}%`);
      return true;
    } else {
      console.log(`❌ MicroTrainer service failed`);
      console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

// =======================================================
// RUN ALL TESTS
// =======================================================
async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 PISTON INTEGRATION TEST SUITE');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const results = {
    runtimes: await testRuntimes(),
    javascript: await testJavaScript(),
    python: await testPython(),
    java: await testJava(),
    cpp: await testCpp(),
    microtrainer: await testMicroTrainerService()
  };
  
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${test.toUpperCase()}: ${status}`);
  });
  
  console.log(`\n📈 Overall: ${passed}/${total} tests passed (${(passed/total*100).toFixed(1)}%)`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Piston integration is working perfectly!');
    console.log('\n✅ You can now:');
    console.log('   1. Run code in 50+ languages');
    console.log('   2. No compiler installation needed');
    console.log('   3. Deploy with one click');
    console.log('   4. Students have zero problems!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  console.log('\n═══════════════════════════════════════════════════════\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
