/**
 * Mini Assessment Card Component
 * 
 * Displays today's mini-assessment with technology badge
 */

import { useNavigate } from 'react-router-dom';

export default function MiniAssessmentCard({ assessment }) {
  const navigate = useNavigate();

  if (!assessment) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">📝 Today's Mini-Assessment</h3>
        <p className="text-gray-600">No assessment available yet. Complete a learning activity to generate one!</p>
      </div>
    );
  }

  const {
    assessmentId,
    technology,
    questions = [],
    timeLimit,
    status
  } = assessment;

  const isCompleted = status === 'completed';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">📝 Today's Mini-Assessment</h3>
      
      <div className="mb-4">
        <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
          {technology}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Questions:</span>
          <span className="font-medium">{questions.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Time Limit:</span>
          <span className="font-medium">~{timeLimit} minutes</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
            {isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>
      
      {!isCompleted && (
        <button
          onClick={() => navigate(`/assessment/${assessmentId}`)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Start Assessment
        </button>
      )}
      
      {isCompleted && (
        <div className="text-center text-green-600 font-medium">
          Great job! You've completed today's assessment 🎉
        </div>
      )}
    </div>
  );
}
