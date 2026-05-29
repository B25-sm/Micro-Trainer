const RUNNER_TIMEOUT_MS = 5000;

const WORKER_BY_LANGUAGE = {
  javascript: () => new Worker(new URL('../workers/javascriptRunner.worker.js', import.meta.url), { type: 'module' }),
  js: () => new Worker(new URL('../workers/javascriptRunner.worker.js', import.meta.url), { type: 'module' }),
  python: () => new Worker(new URL('../workers/pythonRunner.worker.js', import.meta.url), { type: 'module' }),
  py: () => new Worker(new URL('../workers/pythonRunner.worker.js', import.meta.url), { type: 'module' }),
};

export function supportsBrowserExecution(language) {
  return Boolean(WORKER_BY_LANGUAGE[String(language || '').toLowerCase()]);
}

export function unsupportedBrowserExecutionResult(language, mode = 'run') {
  return {
    success: false,
    mode,
    language,
    error:
      'Java execution needs a server-side runner such as Piston or Judge0. Browser execution currently supports JavaScript and Python.',
    stdout: '',
    stderr:
      'Java execution needs a server-side runner such as Piston or Judge0. Browser execution currently supports JavaScript and Python.',
    passedTests: 0,
    totalTests: 0,
    failedTests: [],
    results: [],
    allPassed: false,
    score: 0,
    executionMode: 'unsupported-browser-language',
  };
}

export function normalizeJudgeOutput(data, fallbackMode = 'submit') {
  const results = Array.isArray(data?.results) ? data.results : [];
  const totalTests =
    typeof data?.totalTests === 'number' ? data.totalTests : results.length;
  const passedTests =
    typeof data?.passedTests === 'number'
      ? data.passedTests
      : results.filter((r) => r.passed).length;
  const failedTests = Array.isArray(data?.failedTests)
    ? data.failedTests
    : results.filter((r) => !r.passed);

  return {
    ...data,
    mode: data?.mode || fallbackMode,
    success: data?.success !== false && !data?.error,
    passedTests,
    totalTests,
    failedCount:
      typeof data?.failedCount === 'number'
        ? data.failedCount
        : Math.max(0, totalTests - passedTests),
    failedTests,
    results,
    allPassed:
      data?.allPassed === true ||
      (totalTests > 0 && passedTests === totalTests),
    score:
      typeof data?.score === 'number'
        ? data.score
        : totalTests > 0
          ? (passedTests / totalTests) * 100
          : 0,
  };
}

export function runCodeInBrowser({
  language,
  code,
  mode = 'run',
  input = null,
  testCases = [],
  timeout = RUNNER_TIMEOUT_MS,
}) {
  const lang = String(language || '').toLowerCase();
  const makeWorker = WORKER_BY_LANGUAGE[lang];

  if (!makeWorker) {
    return Promise.resolve(unsupportedBrowserExecutionResult(language, mode));
  }

  const worker = makeWorker();
  const effectiveTimeout = Math.max(1000, Number(timeout || RUNNER_TIMEOUT_MS));

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve(
        normalizeJudgeOutput(
          {
            success: false,
            mode,
            language,
            input,
            error: `Execution timed out after ${effectiveTimeout}ms`,
            stdout: '',
            stderr: `Execution timed out after ${effectiveTimeout}ms`,
            passedTests: 0,
            totalTests: mode === 'run' ? 0 : testCases.length,
            failedTests: [],
            results: [],
            allPassed: false,
            score: 0,
            executionMode: `browser-${lang}`,
          },
          mode
        )
      );
    }, effectiveTimeout);

    worker.onmessage = (event) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(normalizeJudgeOutput(event.data, mode));
    };

    worker.onerror = (error) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(
        normalizeJudgeOutput(
          {
            success: false,
            mode,
            language,
            input,
            error: error.message || 'Browser execution failed',
            stdout: '',
            stderr: error.message || 'Browser execution failed',
            passedTests: 0,
            totalTests: mode === 'run' ? 0 : testCases.length,
            failedTests: [],
            results: [],
            allPassed: false,
            score: 0,
            executionMode: `browser-${lang}`,
          },
          mode
        )
      );
    };

    worker.postMessage({
      language: lang,
      code,
      mode,
      input,
      testCases,
      timeout: effectiveTimeout,
    });
  });
}
