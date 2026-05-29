/**
 * Admin Engagement Dashboard
 * 
 * Real-time monitoring of all students' engagement
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import StudentDetailModal from '../components/admin/StudentDetailModal';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminEngagementDashboard() {
  const [students, setStudents] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_activity');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // WebSocket connection for real-time updates
  const { connected, on } = useWebSocket('admin', 'admin');

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
    fetchActivityFeed();
  }, [filter, sortBy]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected) return;

    // Student activity
    const unsubActivity = on('student:activity', (data) => {
      console.log('Student activity:', data);
      // Add to activity feed
      setActivityFeed(prev => [data, ...prev].slice(0, 50));
      // Refresh students list
      fetchStudents();
    });

    // Student status change
    const unsubStatus = on('student:status_change', (data) => {
      console.log('Student status changed:', data);
      updateStudentInList(data.studentId, { status: data.status });
    });

    // At-risk alert
    const unsubAtRisk = on('alert:at_risk', (data) => {
      console.log('At-risk alert:', data);
      showAlert(`⚠️ Student ${data.studentId} is at risk!`);
    });

    return () => {
      unsubActivity?.();
      unsubStatus?.();
      unsubAtRisk?.();
    };
  }, [connected, on]);

  async function fetchStudents() {
    try {
      const params = new URLSearchParams({
        filter: filter !== 'all' ? filter : '',
        sortBy
      });
      
      const response = await fetch(`${API_URL}/api/analytics/admin/students?${params}`, {
        headers: {
          'role': 'trainer'
        }
      });
      const data = await response.json();
      setStudents(data.students || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  }

  async function fetchActivityFeed() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/admin/activity-feed?limit=50`, {
        headers: {
          'role': 'trainer'
        }
      });
      const data = await response.json();
      setActivityFeed(data.activities || []);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
  }

  function updateStudentInList(studentId, updates) {
    setStudents(prev =>
      prev.map(s => s.studentId === studentId ? { ...s, ...updates } : s)
    );
  }

  function showAlert(message) {
    alert(message);
  }

  function getStatusColor(status) {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Excelling: 'bg-blue-100 text-blue-800',
      At_Risk: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.Inactive;
  }

  function getStatusIcon(status) {
    const icons = {
      Active: '🟢',
      Excelling: '⭐',
      At_Risk: '⚠️',
      Inactive: '🔴'
    };
    return icons[status] || icons.Inactive;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Engagement Dashboard</h1>
          <div className="flex items-center mt-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
            <span className="text-sm text-gray-600">
              {connected ? 'Live Updates Active' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="app-select min-w-[160px]"
              >
                <option value="all">All Students</option>
                <option value="active_today">Active Today</option>
                <option value="inactive_today">Inactive Today</option>
                <option value="at_risk">At Risk</option>
                <option value="high_performers">High Performers</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="app-select min-w-[160px]"
              >
                <option value="last_activity">Last Activity</option>
                <option value="streak">Streak</option>
                <option value="score">Score</option>
                <option value="time_spent">Time Spent</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Students ({students.length})</h2>
              
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.studentId}
                    className="border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getStatusIcon(student.status)}</span>
                        <div>
                          <h3 className="font-bold">{student.studentId}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(student.status)}`}>
                            {student.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-600">
                        Last: {student.lastActivity || 'Never'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div>
                        <div className="text-gray-600">Today</div>
                        <div className="font-medium">{student.todayActivities} activities</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Streak</div>
                        <div className="font-medium">🔥 {student.currentStreak}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Score</div>
                        <div className="font-medium">{Math.round(student.todayScore)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Time</div>
                        <div className="font-medium">{student.timeSpentToday} min</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => setSelectedStudent(student.studentId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Live Activity Feed</h2>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activityFeed.map((activity, index) => (
                  <div key={index} className="text-sm border-l-4 border-blue-500 pl-3 py-2">
                    <div className="font-medium">{activity.studentId}</div>
                    <div className="text-gray-600">{activity.action}</div>
                    {activity.technology && (
                      <div className="text-blue-600">{activity.technology}</div>
                    )}
                    {activity.score && (
                      <div className="text-green-600">{activity.score}%</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Student Detail Modal */}
        {selectedStudent && (
          <StudentDetailModal
            studentId={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </div>
  );
}
