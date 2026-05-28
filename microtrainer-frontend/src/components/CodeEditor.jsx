import { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Check, Code, Loader, RotateCcw } from 'lucide-react';
import { API_BASE } from '../api.js';
import ExecutionConsole from './ExecutionConsole.jsx';
import ResizeSplitter from './ResizeSplitter.jsx';
import { getStarterCode } from '../lib/problemStarters.js';

const PROBLEM_SOLVING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

function normalizeJudgeOutput(data) {
  const results = Array.isArray(data?.results) ? data.results : [];
  const totalTests =
    typeof data?.totalTests === 'number' ? data.totalTests : results.length;
  const passedTests =
    typeof data?.passedTests === 'number'
      ? data.passedTests
      : results.filter((r) => r.passed).length;
  const failedTestCases = Array.isArray(data?.failedTests)
    ? data.failedTests
    : results.filter((r) => !r.passed);

  return {
    ...data,
    mode: data?.mode || 'submit',
    success: data?.success !== false && !data?.error,
    passedTests,
    totalTests,
    failedCount:
      typeof data?.failedCount === 'number'
        ? data.failedCount
        : Math.max(0, totalTests - passedTests),
    failedTests: failedTestCases,
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

const CodeEditor = ({ problem, onSubmit }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const problemId = problem?.id;

  const applyStarter = useCallback(
    (lang = language, starterProblemId = problemId) => {
      setCode(getStarterCode(lang, starterProblemId));
      setOutput(null);
    },
    [language, problemId]
  );

  const loadTemplate = useCallback(async () => {
    const fallback = getStarterCode(language, problemId);
    try {
      const response = await fetch(
        `${API_BASE}/code/template/${language}?problemId=${problemId || ''}`
      );
      const data = await response.json();
      setCode(data.template || fallback);
    } catch (error) {
      console.error('Failed to load template, using local starter:', error);
      setCode(fallback);
    }
    setOutput(null);
  }, [language, problemId]);

  useEffect(() => {
    if (problemId) {
      loadTemplate();
    }
  }, [problemId, loadTemplate]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    applyStarter(newLang, problemId);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput({
        success: false,
        mode: 'run',
        error: 'Please write some code first',
        stdout: '',
        stderr: '',
      });
      return;
    }

    const sampleInput = problem?.testCases?.[0]?.input ?? null;
    setIsRunning(true);
    setOutput({ mode: 'run', pending: true, stdout: '', stderr: '' });

    try {
      const payload = {
        language,
        code,
        mode: 'run',
        input: sampleInput,
        testCases: sampleInput !== null ? [{ input: sampleInput }] : [],
        timeout: 3000,
      };

      console.log('🚀 Run Code payload:', payload);

      const response = await fetch(`${API_BASE}/code/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('✅ Run Code result:', result);

      if (!response.ok) {
        const detail =
          result.errors?.join?.('; ') ||
          result.error ||
          result.message ||
          `HTTP ${response.status}`;
        setOutput({
          success: false,
          mode: 'run',
          error: detail,
          stderr: result.stderr || detail,
          stdout: result.stdout || '',
          input: sampleInput,
        });
        return;
      }

      setOutput({ ...result, mode: 'run', input: result.input ?? sampleInput });
    } catch (error) {
      console.error('❌ Run Code error:', error);
      setOutput({
        success: false,
        mode: 'run',
        error: error.message || 'Failed to execute code',
        stdout: '',
        stderr: error.message || '',
        input: sampleInput,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!problem?.id) {
      setOutput({
        success: false,
        mode: 'submit',
        error: 'No problem selected',
        passedTests: 0,
        totalTests: 0,
        results: [],
      });
      return;
    }

    setIsRunning(true);
    setOutput({ mode: 'submit', pending: true, passedTests: 0, totalTests: problem.testCases?.length || 0, results: [] });

    try {
      const payload = {
        language,
        code,
        studentId: localStorage.getItem('studentId') || 'anonymous',
      };

      console.log('📤 Submit payload:', { problemId: problem.id, ...payload });

      const response = await fetch(`${API_BASE}/problems/${problem.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await response.json();
      console.log('📥 Submit response:', raw);

      const result = normalizeJudgeOutput({ ...raw, mode: 'submit' });
      setOutput(result);

      if (onSubmit && response.ok) {
        onSubmit(result);
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      setOutput({
        success: false,
        mode: 'submit',
        error: error.message || 'Failed to submit solution',
        passedTests: 0,
        totalTests: problem?.testCases?.length || 0,
        failedTests: [],
        results: [],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const sampleInput = problem?.testCases?.[0]?.input;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <Code className="h-5 w-5 text-blue-400" />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROBLEM_SOLVING_LANGUAGES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadTemplate}
            title="Reset to starter template"
            className="flex items-center gap-1 rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Code
          </button>
          {problem && (
            <button
              type="button"
              onClick={submitSolution}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Resizable editor + console split */}
      <ResizeSplitter
        className="min-h-0 flex-1"
        top={
          <Editor
            height="100%"
            language={language === 'java' ? 'java' : language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        }
        bottom={
          <ExecutionConsole
            output={output?.pending ? null : output}
            isRunning={isRunning}
            sampleInput={sampleInput}
          />
        }
      />
    </div>
  );
};

export default CodeEditor;
