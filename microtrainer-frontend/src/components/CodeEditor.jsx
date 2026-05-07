import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Check, X, Code, Loader } from 'lucide-react';

const CodeEditor = ({ problem, onSubmit }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Load template
    loadTemplate();
  };

  const loadTemplate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/code/template/${language}?problemId=${problem?.id || ''}`
      );
      const data = await response.json();
      setCode(data.template);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    setOutput(null);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput({
        success: false,
        error: 'Please write some code first'
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);

    try {
      const response = await fetch('http://localhost:5000/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          testCases: problem?.testCases || [
            { input: 'test', output: 'test' }
          ],
          timeout: 5000
        }),
      });

      const result = await response.json();
      setOutput(result);

      if (onSubmit && result.success) {
        onSubmit(result);
      }
    } catch (error) {
      setOutput({
        success: false,
        error: error.message || 'Failed to execute code'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    if (!problem?.id) {
      alert('No problem selected');
      return;
    }

    setIsRunning(true);

    try {
      const response = await fetch(
        `http://localhost:5000/problems/${problem.id}/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language,
            code,
            studentId: localStorage.getItem('studentId') || 'anonymous'
          }),
        }
      );

      const result = await response.json();
      setOutput(result);

      if (result.success && result.passedTests === result.totalTests) {
        alert(`🎉 All tests passed! Score: ${result.score}%`);
      } else {
        alert(`${result.passedTests}/${result.totalTests} tests passed`);
      }
    } catch (error) {
      setOutput({
        success: false,
        error: error.message || 'Failed to submit solution'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Code className="w-5 h-5 text-blue-400" />
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Code
          </button>

          {problem && (
            <button
              onClick={submitSolution}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Submit
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="p-4 bg-gray-800 border-t border-gray-700 max-h-64 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2">Output:</h3>

          {output.error ? (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold">Error</p>
                  <p className="text-red-300 text-sm mt-1">{output.error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-400">
                  Total Tests: <span className="text-white font-semibold">{output.totalTests}</span>
                </span>
                <span className="text-green-400">
                  Passed: <span className="font-semibold">{output.passedTests}</span>
                </span>
                <span className="text-red-400">
                  Failed: <span className="font-semibold">{output.failedTests}</span>
                </span>
                {output.score !== undefined && (
                  <span className="text-blue-400">
                    Score: <span className="font-semibold">{output.score.toFixed(1)}%</span>
                  </span>
                )}
              </div>

              {/* Test Results */}
              <div className="space-y-2">
                {output.results?.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.passed
                        ? 'bg-green-900/20 border-green-500'
                        : 'bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.passed ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`font-semibold ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                        Test Case {index + 1}
                      </span>
                    </div>

                    <div className="text-sm space-y-1">
                      <div className="text-gray-400">
                        Input: <span className="text-white">{JSON.stringify(result.input)}</span>
                      </div>
                      <div className="text-gray-400">
                        Expected: <span className="text-white">{JSON.stringify(result.expectedOutput)}</span>
                      </div>
                      <div className="text-gray-400">
                        Got: <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                          {JSON.stringify(result.actualOutput)}
                        </span>
                      </div>
                      {result.error && (
                        <div className="text-red-400 mt-2">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
