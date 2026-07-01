import { useState, useEffect, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Check, Code, Loader, RotateCcw } from 'lucide-react';
import { API_BASE } from '../api.js';
import ExecutionConsole from './ExecutionConsole.jsx';
import ResizeSplitter from './ResizeSplitter.jsx';
import { getStarterCode } from '../lib/problemCodeTemplates.js';
import { attachClipboardGuards } from '../lib/monacoEditorGuards.js';
import {
  normalizeJudgeOutput,
  runCodeInBrowser,
  supportsBrowserExecution,
} from '../lib/browserCodeRunner.js';
import { runCodeOnServer, submitProblemOnServer } from '../lib/serverCodeRunner.js';
import { getSessionStudentId, getStudentApiHeaders } from '../utils/authSession';

const PROBLEM_SOLVING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

const CodeEditor = ({ problem, onSubmit, blockClipboard = true }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [clipboardNotice, setClipboardNotice] = useState('');
  const clipboardCleanupRef = useRef(null);
  const problemId = problem?.id;

  const applyStarter = useCallback(
    (lang = language, prob = problem) => {
      setCode(getStarterCode(lang, prob));
      setOutput(null);
    },
    [language, problem]
  );

  const loadTemplate = useCallback(async () => {
    const fallback = getStarterCode(language, problem);
    try {
      const response = await fetch(
        `${API_BASE}/code/template/${language}?problemId=${encodeURIComponent(problemId || '')}`
      );
      const data = await response.json();
      setCode(data.template || fallback);
    } catch (error) {
      console.error('Failed to load template, using local starter:', error);
      setCode(fallback);
    }
    setOutput(null);
  }, [language, problemId, problem]);

  useEffect(() => {
    if (problemId) {
      loadTemplate();
    }
  }, [problemId, loadTemplate]);

  useEffect(() => {
    if (!clipboardNotice) return;
    const t = setTimeout(() => setClipboardNotice(''), 2500);
    return () => clearTimeout(t);
  }, [clipboardNotice]);

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      clipboardCleanupRef.current?.();
      if (blockClipboard) {
        clipboardCleanupRef.current = attachClipboardGuards(editor, monaco, {
          onBlocked: () =>
            setClipboardNotice('Copy and paste are disabled in the coding arena.'),
        });
      }
    },
    [blockClipboard]
  );

  useEffect(
    () => () => {
      clipboardCleanupRef.current?.();
    },
    []
  );

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    applyStarter(newLang, problem);
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
      const sampleInput = problem?.testCases?.[0]?.input ?? null;

      const result = supportsBrowserExecution(language)
        ? await runCodeInBrowser({
            language,
            code,
            mode: 'run',
            input: sampleInput,
            testCases: sampleInput !== null ? [{ input: sampleInput }] : [],
            timeout: 3000,
          })
        : await runCodeOnServer({
            language,
            code,
            mode: 'run',
            input: sampleInput,
            testCases: sampleInput !== null ? [{ input: sampleInput }] : [],
            timeout: 12000,
          });

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
      const studentId = getSessionStudentId() || 'anonymous';

      const result = supportsBrowserExecution(language)
        ? normalizeJudgeOutput(
            await runCodeInBrowser({
              language,
              code,
              mode: 'submit',
              testCases: problem.testCases || [],
              timeout: 5000,
            }),
            'submit'
          )
        : await submitProblemOnServer({
            problemId: problem.id,
            language,
            code,
            studentId,
          });

      const payload = {
        language,
        studentId,
        result: {
          passedTests: result.passedTests,
          totalTests: result.totalTests,
          failedCount: result.failedCount,
          score: result.score,
          allPassed: result.allPassed,
          executionMode: result.executionMode,
        },
      };

      console.log('📤 Submit payload:', { problemId: problem.id, ...payload });

      setOutput(result);

      if (supportsBrowserExecution(language)) {
        try {
          await fetch(`${API_BASE}/problems/${problem.id}/browser-submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getStudentApiHeaders() },
            body: JSON.stringify(payload),
          });
        } catch (recordError) {
          console.warn('Problem submission was graded locally but not recorded:', recordError);
        }
      }

      if (onSubmit) {
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
          <Code className="h-5 w-5 text-gray-400" />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="app-select rounded-lg px-3 py-2 min-w-[120px]"
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
            className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-gray-100 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </button>
          {problem && (
            <button
              type="button"
              onClick={submitSolution}
              disabled={isRunning}
              className="flex items-center gap-2 rounded-lg bg-[#8ab4f8] px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? <Loader className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Submit
            </button>
          )}
        </div>
      </div>

      {clipboardNotice && (
        <div className="shrink-0 border-b border-amber-700/50 bg-amber-950/80 px-4 py-2 text-xs text-amber-200">
          {clipboardNotice}
        </div>
      )}

      {/* Resizable editor + console split */}
      <ResizeSplitter
        className="min-h-0 flex-1"
        top={
          <Editor
            height="100%"
            language={language === 'java' ? 'java' : language}
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              dragAndDrop: false,
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
