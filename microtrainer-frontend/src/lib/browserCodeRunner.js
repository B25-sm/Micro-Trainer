// Browser code execution via Web Workers.
//
// Two problems this file exists to avoid:
//  1. Pyodide (Python) downloads ~10MB of WASM from a CDN on first use. That load
//     must NOT count against the code's execution timeout, or the very first run
//     of even `print(10)` "times out" before Python is ready.
//  2. A worker must be REUSED across runs. Creating + terminating one per run
//     re-downloaded Pyodide every single time, so nothing ever stayed warm.
//
// So: one long-lived worker per language, a ready handshake before the strict
// execution timer starts, and request-id correlation so a warm worker can serve
// many runs safely.

const RUNNER_TIMEOUT_MS = 5000;
// Generous, separate budget for first-time runtime load (Pyodide CDN download).
const LOAD_TIMEOUT_MS = 60000;

const WORKER_BY_LANGUAGE = {
  javascript: () => new Worker(new URL('../workers/javascriptRunner.worker.js', import.meta.url), { type: 'module' }),
  js: () => new Worker(new URL('../workers/javascriptRunner.worker.js', import.meta.url), { type: 'module' }),
  python: () => new Worker(new URL('../workers/pythonRunner.worker.js', import.meta.url), { type: 'module' }),
  py: () => new Worker(new URL('../workers/pythonRunner.worker.js', import.meta.url), { type: 'module' }),
};

// lang -> { worker, readyPromise }. Persists for the life of the page so the
// runtime loads once and stays warm across every problem and every run.
const warmWorkers = new Map();
let requestSeq = 0;

export function supportsBrowserExecution(language) {
  return Boolean(WORKER_BY_LANGUAGE[String(language || '').toLowerCase()]);
}

function evictWorker(lang) {
  const entry = warmWorkers.get(lang);
  if (entry) {
    try {
      entry.worker.terminate();
    } catch {
      // already gone
    }
    warmWorkers.delete(lang);
  }
}

function getWarmWorker(lang) {
  let entry = warmWorkers.get(lang);
  if (entry) return entry;

  const worker = WORKER_BY_LANGUAGE[lang]();
  const readyPromise = new Promise((resolve, reject) => {
    const onMessage = (event) => {
      if (!event.data || event.data.__ready === undefined) return;
      settle();
      if (event.data.__ready) resolve(worker);
      else reject(new Error(event.data.error || 'Runtime failed to initialize'));
    };
    const onError = (error) => {
      settle();
      reject(new Error(error?.message || 'Runtime worker failed to load'));
    };
    function settle() {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    }
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    // Tell the worker to initialize its runtime now (Pyodide download happens here).
    worker.postMessage({ __init: true });
  });

  entry = { worker, readyPromise };
  warmWorkers.set(lang, entry);
  return entry;
}

/**
 * Start loading a runtime ahead of time (e.g. when the editor mounts) so the
 * heavy Pyodide download is finished before the learner ever clicks Run.
 */
export function prewarmBrowserRuntime(language) {
  const lang = String(language || '').toLowerCase();
  if (!WORKER_BY_LANGUAGE[lang]) return;
  getWarmWorker(lang).readyPromise.catch(() => evictWorker(lang));
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

function timeoutResult({ lang, language, mode, input, testCases, message }) {
  return normalizeJudgeOutput(
    {
      success: false,
      mode,
      language,
      input,
      error: message,
      stdout: '',
      stderr: message,
      passedTests: 0,
      totalTests: mode === 'run' ? 0 : testCases.length,
      failedTests: [],
      results: [],
      allPassed: false,
      score: 0,
      executionMode: `browser-${lang}`,
    },
    mode
  );
}

export async function runCodeInBrowser({
  language,
  code,
  mode = 'run',
  input = null,
  testCases = [],
  timeout = RUNNER_TIMEOUT_MS,
}) {
  const lang = String(language || '').toLowerCase();
  if (!WORKER_BY_LANGUAGE[lang]) {
    return unsupportedBrowserExecutionResult(language, mode);
  }

  const execTimeout = Math.max(1000, Number(timeout || RUNNER_TIMEOUT_MS));

  // Phase 1 — ensure the runtime is loaded. This has its OWN budget and is NOT
  // charged against the code's execution time.
  let worker;
  try {
    const entry = getWarmWorker(lang);
    worker = await Promise.race([
      entry.readyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('runtime-load-timeout')), LOAD_TIMEOUT_MS)
      ),
    ]);
  } catch (error) {
    evictWorker(lang);
    const message =
      error?.message === 'runtime-load-timeout'
        ? `The ${lang === 'python' || lang === 'py' ? 'Python' : 'JavaScript'} runtime took too long to load. Check your connection and try again.`
        : `Could not start the ${lang} runtime: ${error?.message || 'unknown error'}`;
    return timeoutResult({ lang, language, mode, input, testCases, message });
  }

  // Phase 2 — run the code against a warm runtime with the strict exec timeout.
  const requestId = ++requestSeq;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      // A busy worker can't be interrupted (e.g. an infinite loop), so kill it;
      // the next run transparently spins up and warms a fresh one.
      evictWorker(lang);
      resolve(
        timeoutResult({
          lang,
          language,
          mode,
          input,
          testCases,
          message: `Execution timed out after ${execTimeout}ms`,
        })
      );
    }, execTimeout);

    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.__ready !== undefined) return; // ignore handshake noise
      if (data.requestId !== requestId) return; // not our response
      cleanup();
      resolve(normalizeJudgeOutput(data, mode));
    };

    const onError = (error) => {
      cleanup();
      evictWorker(lang);
      resolve(
        normalizeJudgeOutput(
          {
            success: false,
            mode,
            language,
            input,
            error: error?.message || 'Browser execution failed',
            stdout: '',
            stderr: error?.message || 'Browser execution failed',
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

    function cleanup() {
      clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
    }

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);

    worker.postMessage({
      requestId,
      language: lang,
      code,
      mode,
      input,
      testCases,
      timeout: execTimeout,
    });
  });
}
