import { useState, useEffect } from 'react';
import { Code2, Lightbulb, Target, Trophy, ChevronRight } from 'lucide-react';
import CodeEditor from '../components/CodeEditor';

const ProblemSolving = () => {
  const [problems, setProblems] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [showHints, setShowHints] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [difficulty]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/problems/difficulty/${difficulty}`
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
      const response = await fetch('http://localhost:5000/problems/stats/all');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getRandomProblem = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/problems/random?difficulty=${difficulty}`
      );
      const data = await response.json();
      setSelectedProblem(data);
    } catch (error) {
      console.error('Failed to fetch random problem:', error);
    }
  };

  const handleSubmit = (result) => {
    console.log('Submission result:', result);
    // You can add more logic here, like showing a success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Problem Solving Arena
              </h1>
              <p className="text-gray-300">
                Practice coding challenges and improve your skills
              </p>
            </div>

            {stats && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                <div className="flex gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-gray-300">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{stats.easy}</div>
                    <div className="text-xs text-gray-300">Easy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
                    <div className="text-xs text-gray-300">Medium</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">{stats.hard}</div>
                    <div className="text-xs text-gray-300">Hard</div>
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
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  difficulty === level
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}

            <button
              onClick={getRandomProblem}
              className="ml-auto px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Random Challenge
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Problem List Sidebar */}
          <div className="col-span-3">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-4">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Problems ({problems.length})
              </h2>

              {loading ? (
                <div className="text-gray-400 text-center py-8">Loading...</div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {problems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => setSelectedProblem(problem)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedProblem?.id === problem.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-medium text-sm">{problem.title}</div>
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
          <div className="col-span-9 space-y-6">
            {selectedProblem ? (
              <>
                {/* Problem Description */}
                <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedProblem.title}
                      </h2>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        difficulty === 'easy'
                          ? 'bg-green-500/20 text-green-400'
                          : difficulty === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {difficulty.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                      <Lightbulb className="w-4 h-4" />
                      {showHints ? 'Hide' : 'Show'} Hints
                    </button>
                  </div>

                  <div className="text-gray-300 mb-6">
                    <p className="text-lg">{selectedProblem.description}</p>
                  </div>

                  {/* Test Cases */}
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Code2 className="w-5 h-5" />
                      Test Cases
                    </h3>

                    {selectedProblem.testCases?.map((testCase, index) => (
                      <div
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                      >
                        <div className="text-sm space-y-2">
                          <div>
                            <span className="text-gray-400">Input:</span>
                            <code className="ml-2 text-blue-400">
                              {JSON.stringify(testCase.input)}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-400">Output:</span>
                            <code className="ml-2 text-green-400">
                              {JSON.stringify(testCase.output)}
                            </code>
                          </div>
                          {testCase.explanation && (
                            <div className="text-gray-400 text-xs mt-2">
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
                    <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5" />
                        Hints
                      </h3>
                      <ul className="space-y-2">
                        {selectedProblem.hints.map((hint, index) => (
                          <li key={index} className="text-yellow-200 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 font-bold">{index + 1}.</span>
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Code Editor */}
                <div className="h-[600px]">
                  <CodeEditor problem={selectedProblem} onSubmit={handleSubmit} />
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-12 text-center">
                <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Problem Selected
                </h3>
                <p className="text-gray-400">
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
