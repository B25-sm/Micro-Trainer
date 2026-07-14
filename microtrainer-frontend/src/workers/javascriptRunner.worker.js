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
    executionMode: 'browser-javascript',
  };
}

async function getSolution(code) {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const loadUserCode = new AsyncFunction(
    `
${code}
if (typeof solution !== 'function') {
  throw new Error('Code must define a solution(input) function');
}
return solution;
`
  );
  return loadUserCode();
}

async function runTestCase(solution, testCase) {
  const stdoutLines = [];
  const originalConsole = self.console;
  const consoleShim = {
    ...originalConsole,
    log: (...args) => stdoutLines.push(args.map(String).join(' ')),
  };

  self.console = consoleShim;
  const start = Date.now();

  try {
    const actualOutput = await solution(testCase.input);
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
      stderr: '',
      error: null,
      executionTime: Date.now() - start,
    };
  } catch (error) {
    return {
      input: testCase.input,
      expectedOutput: testCase.output,
      actualOutput: null,
      passed: false,
      stdout: stdoutLines.join('\n'),
      stderr: error.message || String(error),
      error: error.stack || error.message || String(error),
      executionTime: Date.now() - start,
    };
  } finally {
    self.console = originalConsole;
  }
}

self.onmessage = async (event) => {
  const data = event.data || {};

  // Handshake for protocol parity with the Python worker. JS has no runtime to
  // download, so it is ready immediately.
  if (data.__init) {
    self.postMessage({ __ready: true });
    return;
  }

  const { requestId, language, code, mode, input, testCases = [] } = data;

  try {
    const solution = await getSolution(code);

    if (mode === 'run') {
      const testCase = { input };
      const result = await runTestCase(solution, testCase);
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
        executionMode: 'browser-javascript',
      });
      return;
    }

    const results = [];
    for (const testCase of testCases) {
      results.push(await runTestCase(solution, testCase));
    }

    self.postMessage({ requestId, ...buildJudgeResponse({ mode, language, results }) });
  } catch (error) {
    self.postMessage({
      requestId,
      ...buildJudgeResponse({
        mode,
        language,
        results: [],
        error: error.stack || error.message || String(error),
        stderr: error.message || String(error),
      }),
    });
  }
};
