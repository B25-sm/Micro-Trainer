import { API_BASE } from '../api.js';
import { normalizeJudgeOutput } from './browserCodeRunner.js';

function buildServerError(data, mode, language, fallbackMessage) {
  const msg =
    data?.error ||
    data?.stderr ||
    data?.message ||
    fallbackMessage ||
    'Server execution failed';

  const pistonHint =
    /piston|econnrefused|enotfound|whitelist|server-side runner/i.test(msg)
      ? '\n\nJava/C++ need the backend code runner (Piston). Ask your trainer to set PISTON_URL on the server, or use JavaScript/Python for browser-only practice.'
      : '';

  return normalizeJudgeOutput(
    {
      success: false,
      mode,
      language,
      error: msg + pistonHint,
      stdout: data?.stdout || '',
      stderr: data?.stderr || msg + pistonHint,
      passedTests: 0,
      totalTests: mode === 'submit' ? data?.totalTests || 0 : 0,
      failedTests: data?.failedTests || [],
      results: data?.results || [],
      allPassed: false,
      score: 0,
      executionMode: 'server',
    },
    mode
  );
}

export async function runCodeOnServer({
  language,
  code,
  mode = 'run',
  input = null,
  testCases = [],
  timeout = 8000,
}) {
  try {
    const response = await fetch(`${API_BASE}/code/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        mode,
        input,
        testCases,
        timeout,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return buildServerError(data, mode, language);
    }

    return normalizeJudgeOutput(
      { ...data, language, executionMode: data.executionMode || 'server-piston' },
      mode
    );
  } catch (error) {
    return buildServerError(
      { error: error.message },
      mode,
      language,
      'Could not reach the code execution server. Check your connection or try JavaScript/Python.'
    );
  }
}

export async function submitProblemOnServer({
  problemId,
  language,
  code,
  studentId,
}) {
  try {
    const response = await fetch(`${API_BASE}/problems/${problemId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code,
        studentId: studentId || 'anonymous',
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return buildServerError(data, 'submit', language);
    }

    return normalizeJudgeOutput(
      { ...data, language, executionMode: data.executionMode || 'server-piston' },
      'submit'
    );
  } catch (error) {
    return buildServerError(
      { error: error.message },
      'submit',
      language,
      'Could not reach the server to grade your solution.'
    );
  }
}
