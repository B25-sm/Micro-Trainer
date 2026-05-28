/**
 * Streak Tracker Component
 * 
 * Displays current streak, longest streak, and 30-day calendar
 */

export default function StreakTracker({ streakData }) {
  const {
    currentStreak = 0,
    longestStreak = 0,
    streakAtRisk = false,
    calendar = []
  } = streakData || {};

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Practice Streak</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-4xl mb-2">🔥</div>
          <div className="text-3xl font-bold text-orange-600">{currentStreak}</div>
          <div className="text-sm text-gray-600">Current Streak</div>
          {streakAtRisk && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              ⚠️ At Risk!
            </div>
          )}
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-3xl font-bold text-blue-600">{longestStreak}</div>
          <div className="text-sm text-gray-600">Longest Streak</div>
        </div>
      </div>
      
      {calendar.length > 0 && (
        <div>
          <div className="text-sm text-gray-600 mb-2">Last 30 Days</div>
          <div className="grid grid-cols-10 gap-1">
            {calendar.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded ${
                  day.practiced
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
                title={`${day.date}: ${day.practiced ? `${day.activitiesCompleted} activities` : 'No practice'}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
