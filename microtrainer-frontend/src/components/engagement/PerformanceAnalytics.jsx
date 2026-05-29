/**
 * Performance Analytics Component
 * 
 * Displays detailed performance metrics, trends, and weak areas
 */

export default function PerformanceAnalytics({ analytics }) {
  const {
    engagementScore = 0,
    last30Days = [],
    topicsProgress = [],
    weakAreas = [],
    upcomingMockTests = []
  } = analytics || {};

  // Calculate trend
  const recentScores = last30Days.slice(-7).map(d => d.averageScore).filter(s => s > 0);
  const avgRecentScore = recentScores.length > 0 
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Performance analytics</h3>
      
      {/* Engagement Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Engagement Score</span>
          <span className="text-2xl font-bold text-blue-600">{engagementScore}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${engagementScore}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Based on activity frequency, scores, streak, and consistency
        </p>
      </div>

      {/* Last 30 Days Activity */}
      {last30Days.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Last 30 Days Activity</h4>
          <div className="grid grid-cols-10 gap-1">
            {last30Days.slice(-30).map((day, index) => {
              const hasActivity = day.activitiesCompleted > 0;
              const score = day.averageScore || 0;
              const color = !hasActivity 
                ? 'bg-gray-200' 
                : score >= 80 
                  ? 'bg-green-500' 
                  : score >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500';
              
              return (
                <div
                  key={index}
                  className={`h-8 rounded ${color}`}
                  title={`${day.date}: ${hasActivity ? `${day.activitiesCompleted} activities, ${Math.round(score)}%` : 'No activity'}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {/* Recent Performance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">7-Day Average Score</div>
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(avgRecentScore)}%
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Active Days (30d)</div>
          <div className="text-2xl font-bold text-green-600">
            {last30Days.filter(d => d.activitiesCompleted > 0).length}
          </div>
        </div>
      </div>

      {/* Topics Progress */}
      {topicsProgress.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Topics Progress</h4>
          <div className="space-y-3">
            {topicsProgress.map((topic, index) => {
              const percentage = (topic.topicsMastered / topic.totalTopics) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{topic.technology}</span>
                    <span className="text-gray-600">
                      {topic.topicsMastered}/{topic.totalTopics}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">⚠️ Areas Needing Practice</h4>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Mock Tests */}
      {upcomingMockTests.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">📅 Upcoming Mock Tests</h4>
          <div className="space-y-2">
            {upcomingMockTests.map((test, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{test.technologies.join(', ')}</div>
                  <div className="text-sm text-gray-600">{test.date}</div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Prepare
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
