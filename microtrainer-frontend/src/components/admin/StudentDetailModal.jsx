/**
 * Student Detail Modal Component
 * 
 * Shows detailed information about a student's today's activities
 */

import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function StudentDetailModal({ studentId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  async function fetchStudentDetails() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/admin/student/${studentId}`, {
        headers: {
          'role': 'trainer'
        }
      });
      const data = await response.json();
      setDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student details:', error);
      setLoading(false);
    }
  }

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Student Details: {studentId}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading student details...</p>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Today's Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">Today's Summary</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-bold text-lg">{details.status || 'Inactive'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Activities</div>
                    <div className="font-bold text-lg">{details.todayActivities || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Time Spent</div>
                    <div className="font-bold text-lg">{details.timeSpentToday || 0} min</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                    <div className="font-bold text-lg">{Math.round(details.todayScore || 0)}%</div>
                  </div>
                </div>
              </div>

              {/* Technologies Studied */}
              {details.technologiesStudied && details.technologiesStudied.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Technologies Studied Today</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.technologiesStudied.map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Today's Activities */}
              {details.activities && details.activities.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Today's Activities</h3>
                  <div className="space-y-3">
                    {details.activities.map((activity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{activity.type}</div>
                            <div className="text-sm text-gray-600">{activity.technology}</div>
                          </div>
                          <div className="text-right">
                            {activity.score !== null && (
                              <div className={`font-bold ${
                                activity.score >= 80 ? 'text-green-600' :
                                activity.score >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {Math.round(activity.score)}%
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              {activity.timeSpent} min
                            </div>
                          </div>
                        </div>
                        {activity.conceptId && (
                          <div className="text-sm text-gray-600">
                            Concept: {activity.conceptId}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streak Information */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">Streak Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                    <div className="font-bold text-2xl text-orange-600">
                      🔥 {details.currentStreak || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                    <div className="font-bold text-2xl text-blue-600">
                      🏆 {details.longestStreak || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Engagement Score</div>
                    <div className="font-bold text-2xl text-green-600">
                      {details.engagementScore || 0}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessment Scores */}
              {details.assessmentScores && details.assessmentScores.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3">Recent Assessment Scores</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {details.assessmentScores.map((score, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded text-center ${
                          score >= 80 ? 'bg-green-100 text-green-800' :
                          score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <div className="font-bold text-lg">{Math.round(score)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Activity Message */}
              {(!details.activities || details.activities.length === 0) && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-gray-600">No activities today</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to load student details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
