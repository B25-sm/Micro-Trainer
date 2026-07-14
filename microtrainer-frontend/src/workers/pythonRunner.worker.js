import { loadPyodide } from 'pyodide';

let pyodideReadyPromise;

function normalizeComparable(value) {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        normalizeComparable(nestedValue),
      ])
    );
  }
  return value;
}

function compareOutputs(actual, expected) {
  const a = normalizeComparable(actual);
  const e = normalizeComparable(expected);

  if (typeof a === 'number' && typeof e === 'number') return a === e;
  if (typeof a === 'string' && typeof e === 'number') {
    const parsed = Number(a);
    if (!Number.isNaN(parsed)) return parsed === e;
  }
  if (typeof a === 'number' && typeof e === 'string') {
    const parsed = Number(e);
    if (!Number.isNaN(parsed)) return a === parsed;
  }

  return JSON.stringify(a) === JSON.stringify(e);
}

function buildJudgeResponse({ mode, language, results, error, stdout = '', stderr = '' }) {
  const totalTests = results.length;
  const passedTests = results.filter((result) => result.passed).length;
  const failedTests = results.filter((result) => !result.passed);

  return {
    success: !error,
    mode,
    language,
    stdout,
    stderr,
    error: error || null,
    passedTests,
    totalTests,
    failedCount: Math.max(0, totalTests - passedTests),
    failedTests,
    results,
    allPassed: totalTests > 0 && passedTests === totalTests,
    score: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
    executionMode: 'browser-python-pyodide',
  };
}

function convertPyResult(value) {
  if (value && typeof value.toJs === 'function') {
    const converted = value.toJs({ dict_converter: Object.fromEntries });
    value.destroy?.();
    return converted;
  }
  return value;
}

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/',
    });
  }
  return pyodideReadyPromise;
}

/** Strip student debug lines that call solution(input) — shadows Python's built-in input */
function preparePythonStudentCode(code) {
  const lines = String(code || '').split('\n');
  while (lines.length > 0) {
    const trimmed = lines[lines.length - 1].trim();
    if (!trimmed) {
      lines.pop();
      continue;
    }
    if (/^print\s*\(\s*solution\s*\(/i.test(trimmed)) {
      lines.pop();
      continue;
    }
    break;
  }
  return lines.join('\n');
}

function formatPythonRunError(message) {
  const msg = String(message || '');
  if (
    /invalid literal for int\(\) with base 10: ['"]<['"]/i.test(msg) ||
    /invalid literal for int/i.test(msg) &&
      /built-in function input/i.test(msg)
  ) {
    return (
      'You called solution(input) where `input` is Python\'s built-in function, not the test value. ' +
      'Remove print(solution(input)) at the bottom and use def solution(value): — then click Run.'
    );
  }
  if (/def solution\(input\)/.test(msg)) {
    return 'Rename `def solution(input)` to `def solution(value)` — `input` is reserved in Python.';
  }
  return msg;
}

async function runTestCase(pyodide, code, testCase) {
  const stdoutLines = [];
  const stderrLines = [];
  const start = Date.now();

  pyodide.setStdout({ batched: (text) => stdoutLines.push(text) });
  pyodide.setStderr({ batched: (text) => stderrLines.push(text) });
  pyodide.globals.set('__microtrainer_input', JSON.stringify(testCase.input));

  try {
    await pyodide.runPythonAsync(`
import json
${code}
__microtrainer_result = solution(json.loads(__microtrainer_input))
`);

    const resultProxy = pyodide.globals.get('__microtrainer_result');
    const actualOutput = convertPyResult(resultProxy);
    const expectedOutput =
      Object.prototype.hasOwnProperty.call(testCase, 'output')
        ? testCase.output
        : actualOutput;

    return {
      input: testCase.input,
      expectedOutput,
      actualOutput,
      passed:
        Object.prototype.hasOwnProperty.call(testCase, 'output') &&
        compareOutputs(actualOutput, expectedOutput),
      stdout: stdoutLines.join('\n'),
      stderr: stderrLines.join('\n'),
      error: null,
      executionTime: Date.now() - start,
    };
  } catch (error) {
    const friendly = formatPythonRunError(error.message || String(error));
    return {
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: null,
      passed: false,
      stdout: stdoutLines.join('\n'),
      stderr: stderrLines.join('\n') || friendly,
      error: friendly,
      executionTime: Date.now() - start,
    };
  }
}

self.onmessage = async (event) => {
  const data = event.data || {};

  // Handshake: load Pyodide up front so the download does not count against the
  // caller's execution timeout. Reply __ready once the runtime is usable.
  if (data.__init) {
    try {
      await getPyodide();
      self.postMessage({ __ready: true });
    } catch (error) {
      self.postMessage({ __ready: false, error: error?.message || String(error) });
    }
    return;
  }

  const { requestId, language, code, mode, input, testCases = [] } = data;

  try {
    const pyodide = await getPyodide();

    if (!/^\s*def\s+solution\s*\(/m.test(code)) {
      throw new Error('Code must define a solution(value) function');
    }

    const preparedCode = preparePythonStudentCode(code);

    if (mode === 'run') {
      const result = await runTestCase(pyodide, preparedCode, { input });
      self.postMessage({
        requestId,
        success: !result.error,
        mode: 'run',
        language,
        input,
        stdout:
          result.stdout ||
          (result.actualOutput !== undefined
            ? `${JSON.stringify(result.actualOutput)}\n`
            : ''),
        stderr: result.stderr || '',
        error: result.error || null,
        executionTime: result.executionTime,
        exitCode: result.error ? 1 : 0,
        executionMode: 'browser-python-pyodide',
      });
      return;
    }

    const results = [];
    for (const testCase of testCases) {
      results.push(await runTestCase(pyodide, preparedCode, testCase));
    }

    self.postMessage({ requestId, ...buildJudgeResponse({ mode, language, results }) });
  } catch (error) {
    self.postMessage({
      requestId,
      ...buildJudgeResponse({
        mode,
        language,
        results: [],
        error: error.message || String(error),
        stderr: error.message || String(error),
      }),
    });
  }
};
