// =======================================================
// 🔹 CODE EXECUTION SERVICE
// Primary: Piston API (self-hosted recommended — see docker-compose.piston.yml).
// Fallback: in-process JavaScript (node:vm) and Python (subprocess) when Piston
// is unreachable, in non-production or when USE_LOCAL_CODE_FALLBACK=true.
// =======================================================

const axios = require('axios');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

// Prefer self-hosted Piston (public emkc.org API is whitelist-only as of 2026).
// Self-hosted base: http://127.0.0.1:2000/api/v2  |  emkc proxy: .../api/v2/piston
function resolvePistonApiBase(rawUrl) {
  const raw = (rawUrl || 'http://127.0.0.1:2000/api/v2').replace(/\/$/, '');
  if (/emkc\.org/i.test(raw) && /\/piston$/i.test(raw)) return raw;
  if (raw.endsWith('/api/v2/piston')) return raw.replace(/\/piston$/, '');
  if (raw.endsWith('/api/v2')) return raw;
  if (/^https?:\/\/[^\/]+$/.test(raw)) return `${raw}/api/v2`;
  return raw;
}

const PISTON_API_BASE = resolvePistonApiBase(process.env.PISTON_URL);

/** Self-hosted Piston default limit is often 3000ms — never exceed it unless configured. */
const PISTON_MAX_TIMEOUT_MS = Math.min(
  Math.max(parseInt(process.env.PISTON_MAX_TIMEOUT_MS || '3000', 10) || 3000, 1000),
  30000
);

console.log(`🚀 Code Execution Service initialized with Piston API: ${PISTON_API_BASE}`);
console.log(`   Piston max run/compile timeout: ${PISTON_MAX_TIMEOUT_MS}ms`);

function capPistonTimeout(requestedMs) {
  const requested = requestedMs || PISTON_MAX_TIMEOUT_MS;
  return Math.min(requested, PISTON_MAX_TIMEOUT_MS);
}

// =======================================================
// 🔹 PROBLEM-SOLVING LANGUAGES (UI label → Piston runtime)
// =======================================================
const PROBLEM_SOLVING_LANGUAGES = {
  javascript: { pistonLanguage: 'typescript', pistonVersion: '5.0.3' },
  js: { pistonLanguage: 'typescript', pistonVersion: '5.0.3' },
  python: { pistonLanguage: 'python', pistonVersion: '3.10.0' },
  py: { pistonLanguage: 'python', pistonVersion: '3.10.0' },
  java: { pistonLanguage: 'java', pistonVersion: '15.0.2' },
};

const SUPPORTED_UI_LANGUAGES = 'javascript, python, java';

function resolveProblemSolvingLanguage(uiLanguage) {
  return PROBLEM_SOLVING_LANGUAGES[String(uiLanguage).toLowerCase()] || null;
}

function getPistonFileName(uiLanguage, pistonLanguage) {
  if (pistonLanguage === 'typescript') return 'solution.ts';
  return getFileName(uiLanguage);
}

let _cachedPythonBin = null;

function isPistonUnavailableMessage(msg) {
  if (!msg || typeof msg !== 'string') return false;
  const s = msg.toLowerCase();
  return (
    s.includes('whitelist') ||
    s.includes('engineerman') ||
    s.includes('host your own') ||
    s.includes('piston api') ||
    s.includes('econnrefused') ||
    s.includes('enotfound') ||
    s.includes('socket hang up') ||
    s.includes('network error') ||
    s.includes('run_timeout') ||
    s.includes('cannot exceed') ||
    s.includes('bad request') ||
    s.includes('time limit exceeded') ||
    s.includes('err_bad_request')
  );
}

function shouldUseLocalFallback(errorOrMessage) {
  return isPistonUnavailableMessage(extractPistonError(errorOrMessage));
}

function pistonRunFailed(run, compile) {
  if (run?.code === 0) return false;
  if (compile?.status === 'TO' || run?.status === 'TO') return true;
  if (compile?.code != null && compile.code !== 0) return true;
  if (run?.code != null && run.code !== 0) return true;
  if (!run?.stdout && run?.code == null) return true;
  return false;
}

function allowLocalSandbox() {
  if (process.env.USE_LOCAL_CODE_FALLBACK === 'false') return false;
  if (process.env.USE_LOCAL_CODE_FALLBACK === 'true') return true;
  return process.env.NODE_ENV !== 'production';
}

function supportsLocalOnly(language) {
  const cfg = resolveProblemSolvingLanguage(language);
  if (!cfg) return false;
  const l = String(language).toLowerCase();
  return ['javascript', 'js', 'python', 'py'].includes(l);
}

function extractPistonError(error) {
  if (!error) return '';
  if (error.response?.data) {
    const d = error.response.data;
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    try {
      return JSON.stringify(d);
    } catch {
      return error.message || '';
    }
  }
  if (error.code) return `${error.message || ''} ${error.code}`;
  return error.message || String(error);
}

function formatLocalRunOutput(first) {
  if (!first) return { stdout: '', stderr: 'No output', exitCode: 1, passed: false };
  if (first.error) {
    return { stdout: '', stderr: first.error, exitCode: 1, passed: false };
  }
  return {
    stdout: JSON.stringify(first.actualOutput),
    stderr: '',
    exitCode: 0,
    passed: first.passed,
  };
}

function resolvePythonBinary() {
  if (_cachedPythonBin) return _cachedPythonBin;
  const attempts =
    process.platform === 'win32'
      ? [
          { cmd: 'py', args: ['-3', '-c', 'print(1)'] },
          { cmd: 'python', args: ['-c', 'print(1)'] },
          { cmd: 'python3', args: ['-c', 'print(1)'] }
        ]
      : [
          { cmd: 'python3', args: ['-c', 'print(1)'] },
          { cmd: 'python', args: ['-c', 'print(1)'] }
        ];
  for (const { cmd, args } of attempts) {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 4000 });
    if (r.status === 0) {
      _cachedPythonBin = cmd;
      return cmd;
    }
  }
  _cachedPythonBin = null;
  return null;
}

/**
 * When Piston is down or the public API is blocked, run JS (vm) or Python (subprocess)
 * so Problem Solving still works on a dev machine.
 */
function executeCodeInProcess(language, code, testCases, timeout) {
  const lang = String(language).toLowerCase();
  const isPy = lang === 'python' || lang === 'py';
  const results = [];

  if (isPy) {
    const py = resolvePythonBinary();
    if (!py) {
      return {
        success: false,
        error:
          'Python not found on PATH. Install Python 3, set USE_LOCAL_CODE_FALLBACK=true, or start Piston (see docker-compose.piston.yml).',
        results: []
      };
    }
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      try {
        const inputJson = JSON.stringify(JSON.stringify(testCase.input));
        const runner = `import json\n${code}\nprint(json.dumps(solution(json.loads(${inputJson}))))\n`;
        const spawnArgs =
          py === 'py' ? ['-3', '-c', runner] : ['-c', runner];
        const r = spawnSync(py, spawnArgs, {
          encoding: 'utf8',
          timeout: timeout + 1500,
          maxBuffer: 10 * 1024 * 1024
        });
        if (r.error) throw r.error;
        if (r.status !== 0) {
          results.push({
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: null,
            passed: false,
            error: (r.stderr || r.stdout || 'Python exited non-zero').trim(),
            executionTime: Date.now() - startTime
          });
          continue;
        }
        const actualOutput = parseOutput(r.stdout.trim(), testCase.output);
        const passed = compareOutputs(actualOutput, testCase.output);
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          passed,
          error: null,
          executionTime: Date.now() - startTime
        });
      } catch (e) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          error: e.message || String(e),
          executionTime: Date.now() - startTime
        });
      }
    }
  } else {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      try {
        const sandbox = {
          console: {
            log: () => {},
            error: () => {},
            warn: () => {},
            info: () => {}
          }
        };
        vm.createContext(sandbox);
        const inpEmbed = JSON.stringify(testCase.input);
        const wrapped =
          '(function() {\n' +
          '"use strict";\n' +
          code +
          '\nreturn JSON.stringify(solution(' +
          inpEmbed +
          '));\n})()';
        const script = new vm.Script(wrapped, { filename: 'microtrainer-solution.js' });
        const rawOut = script.runInContext(sandbox, { timeout });
        const actualOutput = parseOutput(String(rawOut).trim(), testCase.output);
        const passed = compareOutputs(actualOutput, testCase.output);
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          passed,
          error: null,
          executionTime: Date.now() - startTime
        });
      } catch (e) {
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          error: (e.name || 'Error') + ': ' + (e.message || String(e)),
          executionTime: Date.now() - startTime
        });
      }
    }
  }

  return buildJudgeResponse({
    results,
    totalTests: testCases.length,
    language,
    executionMode: isPy ? 'local-python' : 'local-javascript',
  });
}

async function callPiston(language, wrappedCode, timeout) {
  const runtime = resolveProblemSolvingLanguage(language);
  if (!runtime) {
    throw new Error(
      `Language '${language}' is not supported. Supported: ${SUPPORTED_UI_LANGUAGES}`
    );
  }

  const pistonTimeout = capPistonTimeout(timeout);

  const response = await axios.post(
    `${PISTON_API_BASE}/execute`,
    {
      language: runtime.pistonLanguage,
      version: runtime.pistonVersion,
      files: [
        {
          name: getPistonFileName(language, runtime.pistonLanguage),
          content: wrappedCode,
        },
      ],
      stdin: '',
      args: [],
      compile_timeout: pistonTimeout,
      run_timeout: pistonTimeout,
    },
    {
      timeout: pistonTimeout + 5000,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: (status) => status < 500,
    }
  );

  if (response.status >= 400) {
    const msg =
      response.data?.message ||
      (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));
    const err = new Error(msg || `Piston HTTP ${response.status}`);
    err.response = response;
    throw err;
  }

  const run = response.data?.run || {};
  const compile = response.data?.compile || {};
  return {
    stdout: (run.stdout || '').trim(),
    stderr: (run.stderr || compile.stderr || '').trim(),
    exitCode: run.code,
    compileOutput: (compile.output || compile.stderr || compile.message || '').trim(),
    compileStatus: compile.status,
    runStatus: run.status,
    failed: pistonRunFailed(run, compile),
    executionTime: null,
  };
}

/**
 * Run editor code once with a single testcase input — returns raw Piston output.
 */
async function runCodeOnce(language, code, input, timeout = 5000) {
  console.log('🏃 runCodeOnce:', {
    language,
    input: JSON.stringify(input),
    codeLength: code?.length,
  });

  if (!code || code.trim().length === 0) {
    return {
      success: false,
      mode: 'run',
      error: 'Code cannot be empty',
      stdout: '',
      stderr: '',
      exitCode: 1,
      input,
    };
  }

  const runtime = resolveProblemSolvingLanguage(language);
  if (!runtime) {
    return {
      success: false,
      mode: 'run',
      error: `Language '${language}' is not supported. Supported: ${SUPPORTED_UI_LANGUAGES}`,
      stdout: '',
      stderr: '',
      exitCode: 1,
      input,
    };
  }

  const startTime = Date.now();

  try {
    const wrappedCode = wrapCodeForExecution(language, code, input);
    const pistonResult = await callPiston(language, wrappedCode, timeout);
    const executionTime = Date.now() - startTime;

    if (
      pistonResult.failed &&
      allowLocalSandbox() &&
      supportsLocalOnly(language)
    ) {
      console.warn('⚠️ Piston run failed — using local sandbox (run once)');
      const local = executeCodeInProcess(language, code, [{ input, output: null }], timeout);
      const formatted = formatLocalRunOutput(local.results?.[0]);
      return {
        success: formatted.exitCode === 0,
        mode: 'run',
        stdout: formatted.stdout,
        stderr: formatted.stderr,
        exitCode: formatted.exitCode,
        input,
        executionTime,
        executionMode: local.executionMode,
      };
    }

    if (pistonResult.failed || pistonResult.exitCode !== 0) {
      const errMsg =
        pistonResult.stderr ||
        pistonResult.stdout ||
        pistonResult.compileOutput ||
        'Execution failed';
      console.log('🏃 runCodeOnce failed:', errMsg.substring(0, 200));
      return {
        success: false,
        mode: 'run',
        stdout: pistonResult.stdout,
        stderr: errMsg,
        exitCode: pistonResult.exitCode,
        input,
        executionTime,
        compileOutput: pistonResult.compileOutput || null,
      };
    }

    console.log('🏃 runCodeOnce stdout:', pistonResult.stdout.substring(0, 200));
    return {
      success: true,
      mode: 'run',
      stdout: pistonResult.stdout,
      stderr: pistonResult.stderr,
      exitCode: 0,
      input,
      executionTime,
      compileOutput: pistonResult.compileOutput || null,
    };
  } catch (error) {
    const errStr = extractPistonError(error);
    console.error('🏃 runCodeOnce Piston error:', errStr);
    if (shouldUseLocalFallback(error) && allowLocalSandbox() && supportsLocalOnly(language)) {
      console.warn('⚠️ Piston request failed — using local sandbox (run once)');
      const local = executeCodeInProcess(language, code, [{ input, output: null }], timeout);
      const formatted = formatLocalRunOutput(local.results?.[0]);
      return {
        success: formatted.exitCode === 0,
        mode: 'run',
        stdout: formatted.stdout,
        stderr: formatted.stderr,
        exitCode: formatted.exitCode,
        input,
        executionTime: Date.now() - startTime,
        executionMode: local.executionMode,
      };
    }

    return {
      success: false,
      mode: 'run',
      error: errStr || error.message || 'Execution failed',
      stdout: '',
      stderr: errStr,
      exitCode: 1,
      input,
      executionTime: Date.now() - startTime,
    };
  }
}

// =======================================================
// 🔹 MAIN EXECUTION FUNCTION
// =======================================================
async function executeCode(language, code, testCases, timeout = PISTON_MAX_TIMEOUT_MS) {
  try {
    console.log(`📝 executeCode (judge): ${language}, ${testCases?.length} test(s)`);

    if (!code || code.trim().length === 0) {
      return buildJudgeResponse({
        totalTests: testCases?.length || 0,
        language,
        error: 'Code cannot be empty',
      });
    }

    if (!testCases || testCases.length === 0) {
      return buildJudgeResponse({
        language,
        error: 'No test cases provided',
      });
    }

    if (!resolveProblemSolvingLanguage(language)) {
      return buildJudgeResponse({
        totalTests: testCases.length,
        language,
        error: `Language '${language}' is not supported. Supported: ${SUPPORTED_UI_LANGUAGES}`,
      });
    }

    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(
        `  Test ${i + 1}/${testCases.length}: input=${JSON.stringify(testCase.input)}`
      );

      try {
        const startTime = Date.now();
        const wrappedCode = wrapCodeForExecution(language, code, testCase.input);
        const pistonResult = await callPiston(language, wrappedCode, timeout);
        const executionTime = Date.now() - startTime;

        if (pistonResult.failed || pistonResult.exitCode !== 0) {
          const errorMsg =
            pistonResult.stderr ||
            pistonResult.compileOutput ||
            pistonResult.stdout ||
            'Execution failed';
          console.log(`  ❌ Test ${i + 1} runtime error: ${errorMsg.substring(0, 120)}`);

          if (
            (shouldUseLocalFallback(errorMsg) || pistonResult.failed) &&
            allowLocalSandbox() &&
            supportsLocalOnly(language)
          ) {
            console.warn('⚠️ Piston failed — using local sandbox for all testcases');
            return executeCodeInProcess(language, code, testCases, timeout);
          }

          results.push({
            input: testCase.input,
            expectedOutput: testCase.output,
            actualOutput: null,
            passed: false,
            error: errorMsg,
            executionTime,
          });
          continue;
        }

        const actualOutput = parseOutput(pistonResult.stdout, testCase.output);
        const passed = compareOutputs(actualOutput, testCase.output);

        console.log(
          `  ${passed ? '✅' : '❌'} Test ${i + 1}: expected=${JSON.stringify(testCase.output)}, got=${JSON.stringify(actualOutput)}`
        );

        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput,
          passed,
          error: passed ? null : `Expected ${JSON.stringify(testCase.output)}, got ${JSON.stringify(actualOutput)}`,
          executionTime,
          stdout: pistonResult.stdout,
        });
      } catch (error) {
        const errStr = extractPistonError(error);
        console.log(`  ❌ Test ${i + 1} error: ${error.message}`);

        if (
          shouldUseLocalFallback(error) &&
          allowLocalSandbox() &&
          supportsLocalOnly(language)
        ) {
          console.warn('⚠️ Piston request failed — using local sandbox');
          return executeCodeInProcess(language, code, testCases, timeout);
        }

        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: null,
          passed: false,
          error: error.response?.data?.message || error.message || 'Execution failed',
          executionTime: 0,
        });
      }
    }

    const judge = buildJudgeResponse({
      results,
      totalTests: testCases.length,
      language,
    });
    console.log(
      `✅ Judge complete: ${judge.passedTests}/${judge.totalTests} passed`
    );
    return judge;
  } catch (error) {
    console.error(`❌ Execution error: ${error.message}`);
    return buildJudgeResponse({
      totalTests: testCases?.length || 0,
      language,
      error: error.message,
    });
  }
}

// =======================================================
// 🔹 WRAP CODE FOR EXECUTION
// =======================================================
function wrapCodeForExecution(language, code, input) {
  const inputStr = JSON.stringify(input);

  switch (String(language).toLowerCase()) {
    case 'javascript':
    case 'js':
      return `${code}\nconsole.log(JSON.stringify(solution(${inputStr})));`;

    case 'python':
    case 'py':
      return `import json\n${code}\nprint(json.dumps(solution(${inputStr})))`;

    case 'java':
      return `import com.google.gson.*;
public class Main {
    ${code.replace(/public\s+/g, '')}
    public static void main(String[] args) {
        Main m = new Main();
        Gson gson = new Gson();
        Object result = m.solution(gson.fromJson("${inputStr.replace(/"/g, '\\"')}", Object.class));
        System.out.println(gson.toJson(result));
    }
}`;

    default:
      throw new Error(
        `Language '${language}' is not supported. Supported: ${SUPPORTED_UI_LANGUAGES}`
      );
  }
}

// =======================================================
// 🔹 GET FILE NAME FOR LANGUAGE
// =======================================================
function getFileName(language) {
  const fileNames = {
    javascript: 'solution.js',
    js: 'solution.js',
    python: 'solution.py',
    py: 'solution.py',
    java: 'Main.java',
  };
  return fileNames[String(language).toLowerCase()] || 'solution.txt';
}

// =======================================================
// 🔹 PARSE OUTPUT
// =======================================================
function parseOutput(output, expectedOutput) {
  try {
    // Try to parse as JSON
    return JSON.parse(output);
  } catch (e) {
    // If not JSON, try to parse as number
    const num = Number(output);
    if (!isNaN(num) && typeof expectedOutput === 'number') {
      return num;
    }
    // Return as string
    return output;
  }
}

// =======================================================
// 🔹 COMPARE OUTPUTS
// =======================================================
function normalizeComparable(value) {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeComparable(v);
    }
    return out;
  }
  return value;
}

function compareOutputs(actual, expected) {
  const a = normalizeComparable(actual);
  const e = normalizeComparable(expected);
  if (typeof a === 'number' && typeof e === 'number') {
    return a === e;
  }
  if (typeof a === 'string' && typeof e === 'number') {
    const n = Number(a);
    if (!Number.isNaN(n)) return n === e;
  }
  if (typeof a === 'number' && typeof e === 'string') {
    const n = Number(e);
    if (!Number.isNaN(n)) return a === n;
  }
  return JSON.stringify(a) === JSON.stringify(e);
}

/**
 * Stable judge response for Submit and multi-test Run.
 */
function buildJudgeResponse({
  results = [],
  totalTests = 0,
  language = null,
  error = null,
  executionMode = 'piston',
}) {
  const passedTests = results.filter((r) => r.passed).length;
  const total = totalTests || results.length;
  const failedTestCases = results.filter((r) => !r.passed);

  return {
    success: !error,
    mode: 'judge',
    allPassed: total > 0 && passedTests === total,
    passedTests,
    totalTests: total,
    failedCount: Math.max(0, total - passedTests),
    failedTests: failedTestCases,
    results,
    language,
    score: total > 0 ? (passedTests / total) * 100 : 0,
    error: error || null,
    executionMode,
  };
}

// =======================================================
// 🔹 CODE VALIDATION
// =======================================================
function validateCode(language, code) {
  const errors = [];

  if (!resolveProblemSolvingLanguage(language)) {
    errors.push(`Language must be one of: ${SUPPORTED_UI_LANGUAGES}`);
    return { valid: false, errors };
  }

  if (!code || code.trim().length === 0) {
    errors.push('Code cannot be empty');
    return { valid: false, errors };
  }

  const lang = String(language).toLowerCase();

  if (lang === 'javascript' || lang === 'js') {
    if (!code.includes('function') && !code.includes('=>')) {
      errors.push('Code must contain at least one function');
    }
  }

  if (lang === 'python' || lang === 'py') {
    if (!code.includes('def ')) {
      errors.push('Code must contain at least one function definition');
    }
  }

  if (lang === 'java') {
    if (!code.includes('solution')) {
      errors.push('Code must define a solution method');
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

// =======================================================
// 🔹 GET CODE TEMPLATE (solution(input) contract)
// =======================================================
const DEFAULT_STARTERS = {
  javascript: `// Testcase input is injected automatically — do not hardcode values
function solution(input) {
  // Your code here
  return null;
}`,
  python: `# Testcase input is injected automatically — do not hardcode values
def solution(input):
    # Your code here
    return None`,
  java: `// Testcase input is injected automatically — do not hardcode values
Object solution(Object input) {
    // Your code here
    return null;
}`,
};

const PROBLEM_STARTERS = {
  'easy-num-1': {
    javascript: `function solution(input) {
  let num = parseInt(String(input).trim(), 10);
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return sum;
}`,
    python: `def solution(input):
    num = int(str(input).strip())
    total = 0
    while num > 0:
        total += num % 10
        num //= 10
    return total`,
    java: `Object solution(Object input) {
    int num = Integer.parseInt(String.valueOf(input).trim());
    int sum = 0;
    while (num > 0) {
        sum += num % 10;
        num /= 10;
    }
    return sum;
}`,
  },
  'easy-num-2': {
    javascript: `function solution(input) {
  const s = String(input).trim();
  return parseInt(s.split('').reverse().join(''), 10);
}`,
    python: `def solution(input):
    s = str(input).strip()
    return int(s[::-1])`,
    java: `Object solution(Object input) {
    String s = String.valueOf(input).trim();
    return Integer.parseInt(new StringBuilder(s).reverse().toString());
}`,
  },
  'easy-num-3': {
    javascript: `function solution(input) {
  let n = parseInt(String(input).trim(), 10);
  let fact = 1;
  for (let i = 2; i <= n; i++) fact *= i;
  return fact;
}`,
    python: `def solution(input):
    n = int(str(input).strip())
    fact = 1
    for i in range(2, n + 1):
        fact *= i
    return fact`,
    java: `Object solution(Object input) {
    int n = Integer.parseInt(String.valueOf(input).trim());
    long fact = 1;
    for (int i = 2; i <= n; i++) fact *= i;
    return (int) fact;
}`,
  },
};

function getCodeTemplate(language, problemId) {
  const key =
    String(language).toLowerCase() === 'js'
      ? 'javascript'
      : String(language).toLowerCase() === 'py'
        ? 'python'
        : String(language).toLowerCase();

  if (problemId && PROBLEM_STARTERS[problemId]?.[key]) {
    return PROBLEM_STARTERS[problemId][key];
  }

  return DEFAULT_STARTERS[key] || null;
}

module.exports = {
  executeCode,
  runCodeOnce,
  buildJudgeResponse,
  validateCode,
  getCodeTemplate,
};
