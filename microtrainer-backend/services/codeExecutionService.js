// =======================================================
// 🔹 CODE EXECUTION SERVICE
// Safely execute user code with test cases
// =======================================================

const { VM } = require('vm2');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// =======================================================
// 🔹 JAVASCRIPT CODE EXECUTION (VM2 - Sandboxed)
// =======================================================
async function executeJavaScript(code, testCases, timeout = 5000) {
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const vm = new VM({
        timeout: timeout,
        sandbox: {
          console: {
            log: () => {}, // Disable console.log in sandbox
          }
        }
      });

      // Wrap code to capture function output
      const wrappedCode = `
        ${code}
        
        // Find the main function (first function declaration)
        const functionMatch = \`${code}\`.match(/function\\s+(\\w+)/);
        const functionName = functionMatch ? functionMatch[1] : null;
        
        if (functionName && typeof eval(functionName) === 'function') {
          const result = eval(functionName)(${JSON.stringify(testCase.input)});
          result;
        } else {
          throw new Error('No function found in code');
        }
      `;

      const result = vm.run(wrappedCode);
      
      const passed = JSON.stringify(result) === JSON.stringify(testCase.output);
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: result,
        passed: passed,
        error: null,
        executionTime: 0 // VM2 doesn't provide execution time
      });
      
    } catch (error) {
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: null,
        passed: false,
        error: error.message,
        executionTime: 0
      });
    }
  }
  
  const passedCount = results.filter(r => r.passed).length;
  
  return {
    success: true,
    totalTests: testCases.length,
    passedTests: passedCount,
    failedTests: testCases.length - passedCount,
    results: results,
    language: 'javascript'
  };
}

// =======================================================
// 🔹 PYTHON CODE EXECUTION (Subprocess)
// =======================================================
async function executePython(code, testCases, timeout = 5000) {
  const results = [];
  const tempDir = path.join(__dirname, '../temp');
  
  // Ensure temp directory exists
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
  
  for (const testCase of testCases) {
    const fileId = uuidv4();
    const filePath = path.join(tempDir, `${fileId}.py`);
    
    try {
      // Create Python file with test case
      const pythonCode = `
import json
import sys

${code}

# Get function name (first function definition)
import re
match = re.search(r'def\\s+(\\w+)', '''${code}''')
if match:
    function_name = match.group(1)
    input_data = ${JSON.stringify(testCase.input)}
    result = eval(f"{function_name}({repr(input_data)})")
    print(json.dumps(result))
else:
    print(json.dumps({"error": "No function found"}))
`;

      await fs.writeFile(filePath, pythonCode);
      
      // Execute Python code
      const startTime = Date.now();
      const result = await executePythonFile(filePath, timeout);
      const executionTime = Date.now() - startTime;
      
      // Clean up temp file
      await fs.unlink(filePath).catch(() => {});
      
      if (result.error) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          error: result.error,
          executionTime: executionTime
        });
      } else {
        const actualOutput = result.output;
        const passed = JSON.stringify(actualOutput) === JSON.stringify(testCase.output);
        
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: actualOutput,
          passed: passed,
          error: null,
          executionTime: executionTime
        });
      }
      
    } catch (error) {
      // Clean up on error
      await fs.unlink(filePath).catch(() => {});
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: null,
        passed: false,
        error: error.message,
        executionTime: 0
      });
    }
  }
  
  const passedCount = results.filter(r => r.passed).length;
  
  return {
    success: true,
    totalTests: testCases.length,
    passedTests: passedCount,
    failedTests: testCases.length - passedCount,
    results: results,
    language: 'python'
  };
}

// Helper function to execute Python file
function executePythonFile(filePath, timeout) {
  return new Promise((resolve) => {
    const python = spawn('python', [filePath]);
    let output = '';
    let error = '';
    
    const timer = setTimeout(() => {
      python.kill();
      resolve({ error: 'Execution timeout exceeded', output: null });
    }, timeout);
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      clearTimeout(timer);
      
      if (code !== 0) {
        resolve({ error: error || 'Execution failed', output: null });
      } else {
        try {
          const result = JSON.parse(output.trim());
          resolve({ error: null, output: result });
        } catch (e) {
          resolve({ error: 'Invalid output format', output: null });
        }
      }
    });
  });
}

// =======================================================
// 🔹 MAIN EXECUTION FUNCTION
// =======================================================
async function executeCode(language, code, testCases, timeout = 5000) {
  try {
    // Validate inputs
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        error: 'Code cannot be empty',
        results: []
      };
    }
    
    if (!testCases || testCases.length === 0) {
      return {
        success: false,
        error: 'No test cases provided',
        results: []
      };
    }
    
    // Execute based on language
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return await executeJavaScript(code, testCases, timeout);
      
      case 'python':
      case 'py':
        return await executePython(code, testCases, timeout);
      
      default:
        return {
          success: false,
          error: `Language '${language}' is not supported yet`,
          results: []
        };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      results: []
    };
  }
}

// =======================================================
// 🔹 CODE VALIDATION
// =======================================================
function validateCode(language, code) {
  const errors = [];
  
  if (!code || code.trim().length === 0) {
    errors.push('Code cannot be empty');
    return { valid: false, errors };
  }
  
  // Basic syntax checks
  if (language === 'javascript') {
    // Check for function declaration
    if (!code.includes('function') && !code.includes('=>')) {
      errors.push('Code must contain at least one function');
    }
    
    // Check for dangerous code
    const dangerousPatterns = [
      /require\s*\(/,
      /import\s+/,
      /eval\s*\(/,
      /Function\s*\(/,
      /child_process/,
      /fs\./,
      /process\./
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        errors.push('Code contains potentially dangerous operations');
        break;
      }
    }
  }
  
  if (language === 'python') {
    // Check for function definition
    if (!code.includes('def ')) {
      errors.push('Code must contain at least one function definition');
    }
    
    // Check for dangerous imports
    const dangerousImports = [
      'os',
      'subprocess',
      'sys.exit',
      '__import__',
      'eval',
      'exec'
    ];
    
    for (const imp of dangerousImports) {
      if (code.includes(imp)) {
        errors.push('Code contains potentially dangerous operations');
        break;
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// =======================================================
// 🔹 GET CODE TEMPLATE
// =======================================================
function getCodeTemplate(language, problemId) {
  const templates = {
    javascript: `// Write your solution here
function solution(input) {
  // Your code here
  
  return result;
}

// Example:
// solution([1, 2, 3, 4, 5]) should return expected output
`,
    python: `# Write your solution here
def solution(input):
    # Your code here
    
    return result

# Example:
# solution([1, 2, 3, 4, 5]) should return expected output
`
  };
  
  return templates[language] || templates.javascript;
}

module.exports = {
  executeCode,
  validateCode,
  getCodeTemplate,
  executeJavaScript,
  executePython
};
