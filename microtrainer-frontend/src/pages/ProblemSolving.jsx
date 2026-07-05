import { useState, useEffect } from 'react';
import { Code2, Lightbulb, Target, Trophy, ChevronRight, History } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';
import { API_BASE, getCodePracticeHistory } from '../api.js';
import { getStudentId } from '../utils/studentAuth';
import { btnPrimary, btnSecondary, headingPage, textMuted, card } from '../lib/ui';

const ProblemSolving = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [showHints, setShowHints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set());
  const [solvedByDifficulty, setSolvedByDifficulty] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [difficulty]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const studentId = getStudentId();
    if (!studentId) return;
    try {
      const response = await getCodePracticeHistory(studentId);
      setAttempts(response.data.attempts || []);
      setSolvedProblemIds(new Set(response.data.solvedProblemIds || []));
      setSolvedByDifficulty(
        response.data.solvedByDifficulty || { easy: 0, medium: 0, hard: 0 }
      );
    } catch (error) {
      console.error('Failed to fetch code practice history:', error);
    }
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/problems/difficulty/${difficulty}`
      );
      const data = await response.json();
      setProblems(data.problems || []);
      
      // Auto-select first problem
      if (data.problems && data.problems.length > 0 && !selectedProblem) {
        setSelectedProblem(data.problems[0]);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/problems/stats/all`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getRandomProblem = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/problems/random?difficulty=${difficulty}`
      );
      const data = await response.json();
      setSelectedProblem(data);
    } catch (error) {
      console.error('Failed to fetch random problem:', error);
    }
  };

  const handleSubmit = () => {
    // Re-read the ledger — the submit request already persisted this attempt server-side.
    fetchHistory();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`${headingPage} mb-2`}>
                Problem solving
              </h1>
              <p className={textMuted}>
                Practice coding challenges and improve your skills
              </p>
            </div>

            {stats && (
              <div className={`${card} p-4`}>
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                      {solvedByDifficulty.easy + solvedByDifficulty.medium + solvedByDifficulty.hard}/{stats.total}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-700 dark:text-gray-300 tabular-nums">{solvedByDifficulty.easy}/{stats.easy}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Easy</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-700 dark:text-gray-300 tabular-nums">{solvedByDifficulty.medium}/{stats.medium}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Medium</div>
                  </div>
                  <div>
                    <div className="text-xl font-medium text-gray-700 dark:text-gray-300 tabular-nums">{solvedByDifficulty.hard}/{stats.hard}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Hard</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="flex gap-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  difficulty === level
                    ? 'border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className={`ml-auto ${btnSecondary}`}
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide history' : 'History'}
            </button>

            <button
              type="button"
              onClick={getRandomProblem}
              className={btnPrimary}
            >
              <Trophy className="w-4 h-4" />
              Random challenge
            </button>
          </div>

          {showHistory && (
            <div className={`${card} mt-3 p-4`}>
              <h3 className="text-gray-900 dark:text-gray-100 text-sm font-medium mb-3">
                Recent attempts
              </h3>
              {attempts.length === 0 ? (
                <p className={`${textMuted} text-sm`}>
                  No attempts yet — submit a solution to start building your history.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1.5">
                  {attempts.map((attempt, index) => (
                    <div
                      key={`${attempt.problemId}-${attempt.timestamp}-${index}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124] px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={
                            attempt.passed
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-500 dark:text-red-400'
                          }
                        >
                          {attempt.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-gray-800 dark:text-gray-200 truncate">
                          {attempt.title}
                        </span>
                        {attempt.difficulty && (
                          <span className="shrink-0 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {attempt.difficulty}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Problem List Sidebar */}
          <div className="flex min-h-[28rem] flex-col lg:col-span-3">
            <div className={`${card} flex min-h-0 flex-1 flex-col p-4`}>
              <h2 className="text-gray-900 dark:text-gray-100 text-sm font-medium mb-4 flex items-center gap-2 shrink-0">
                <Target className="w-5 h-5" />
                Problems ({problems.length})
              </h2>

              {loading ? (
                <div className="text-gray-400 dark:text-gray-500 text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-2 min-h-0 flex-1 overflow-y-auto">
                  {problems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`w-full text-left p-3 rounded-lg transition border ${
                        selectedProblem?.id === problem.id
                          ? 'bg-gray-100 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
                          : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {solvedProblemIds.has(problem.id) && (
                          <span className="text-emerald-600 dark:text-emerald-400" title="Solved">✓</span>
                        )}
                        {problem.title}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {problem.id}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Problem Details & Editor */}
          <div className="flex min-h-0 flex-col gap-4 lg:col-span-9">
            {selectedProblem ? (
              <>
                {/* Problem Description */}
                <div className={`max-h-[300px] shrink-0 overflow-y-auto ${card} p-6`}>
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {selectedProblem.title}
                      </h2>
                      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {difficulty}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHints(!showHints)}
                      className={btnSecondary}
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Hide hints' : 'Show hints'}
                    </button>
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 mb-6">
                    <p className="text-lg">{selectedProblem.description}</p>
                  </div>

                  {/* Test Cases */}
                  <div className="space-y-4">
                    <h3 className="text-gray-800 dark:text-gray-100 font-semibold flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      Test Cases
                    </h3>

                    {selectedProblem.testCases?.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-[#202124] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Input:</span>
                            <code className="ml-2 font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                              {JSON.stringify(testCase.input)}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Output:</span>
                            <code className="ml-2 font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                              {JSON.stringify(testCase.output)}
                            </code>
                          </div>
                          {testCase.explanation && (
                            <div className="text-gray-600 dark:text-gray-300 text-xs mt-2">
                              <ChevronRight className="w-3 h-3 inline mr-1" />
                              {testCase.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hints */}
                  {showHints && selectedProblem.hints && (
                    <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#202124] p-4">
                      <h3 className="text-gray-900 dark:text-gray-100 text-sm font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-gray-500" />
                        Hints
                      </h3>
                      <ul className="space-y-2">
                        {selectedProblem.hints.map((hint, index) => (
                          <li key={index} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500 tabular-nums">{index + 1}.</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Code Editor */}
                <div className="flex min-h-[29rem] flex-1 flex-col">
                  <CodeEditor
                    key={`${selectedProblem.id}-${selectedProblem.title}`}
                    problem={selectedProblem}
                    onSubmit={handleSubmit}
                  />
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-[#292a2d] rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm">
                <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  No Problem Selected
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select a problem from the list or try a random challenge
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolving;
