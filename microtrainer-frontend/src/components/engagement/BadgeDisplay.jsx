/**
 * Badge Display Component
 * 
 * Shows earned badges and progress toward next badge
 */

const BADGE_DEFINITIONS = {
  'first_step': {
    icon: '🎯',
    name: 'First Step',
    description: 'Completed first mini-assessment',
    color: 'bg-blue-100 text-blue-800'
  },
  'week_warrior': {
    icon: '🔥',
    name: 'Week Warrior',
    description: '7-day practice streak',
    color: 'bg-orange-100 text-orange-800'
  },
  'month_master': {
    icon: '🏆',
    name: 'Month Master',
    description: '30-day practice streak',
    color: 'bg-purple-100 text-purple-800'
  },
  'century_club': {
    icon: '💯',
    name: 'Century Club',
    description: '100-day practice streak',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'perfect_week': {
    icon: '⭐',
    name: 'Perfect Week',
    description: 'Practiced all 7 days',
    color: 'bg-green-100 text-green-800'
  },
  'mock_master': {
    icon: '🎓',
    name: 'Mock Master',
    description: 'Scored 80%+ on mock test',
    color: 'bg-indigo-100 text-indigo-800'
  },
  'topic_expert': {
    icon: '🧠',
    name: 'Topic Expert',
    description: '90%+ on 5 consecutive assessments',
    color: 'bg-pink-100 text-pink-800'
  }
};

export default function BadgeDisplay({ badges = [], currentStreak = 0, syncStatus }) {
  const badgesLocked = syncStatus && !syncStatus.officialBenefitsEnabled;

  // Calculate progress toward next badges
  const nextBadges = [];
  
  // Streak-based badges
  if (currentStreak < 7) {
    nextBadges.push({
      ...BADGE_DEFINITIONS.week_warrior,
      progress: currentStreak,
      target: 7,
      type: 'streak'
    });
  } else if (currentStreak < 30) {
    nextBadges.push({
      ...BADGE_DEFINITIONS.month_master,
      progress: currentStreak,
      target: 30,
      type: 'streak'
    });
  } else if (currentStreak < 100) {
    nextBadges.push({
      ...BADGE_DEFINITIONS.century_club,
      progress: currentStreak,
      target: 100,
      type: 'streak'
    });
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">🏅 Badges & Achievements</h3>
      {badgesLocked && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Official badges are locked until progress sync reconnects. Your learning still works, but only synced progress counts for trainer verification.
        </div>
      )}
      
      {/* Earned Badges */}
      {badges.length > 0 ? (
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Earned Badges ({badges.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map((badge, index) => {
              const badgeInfo = BADGE_DEFINITIONS[badge.badgeId] || {
                icon: '🎖️',
                name: badge.badgeName,
                description: badge.badgeType,
                color: 'bg-gray-100 text-gray-800'
              };
              
              return (
                <div
                  key={index}
                  className={`${badgeInfo.color} p-4 rounded-lg text-center`}
                >
                  <div className="text-4xl mb-2">{badgeInfo.icon}</div>
                  <div className="font-bold text-sm">{badgeInfo.name}</div>
                  <div className="text-xs opacity-75 mt-1">{badgeInfo.description}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mb-6 text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600">No badges earned yet</p>
          <p className="text-sm text-gray-500">Complete activities to earn your first badge!</p>
        </div>
      )}

      {/* Progress Toward Next Badge */}
      {nextBadges.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Next Badge Progress</h4>
          <div className="space-y-4">
            {nextBadges.map((badge, index) => {
              const percentage = (badge.progress / badge.target) * 100;
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{badge.icon}</span>
                      <div>
                        <div className="font-bold">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{badge.progress}/{badge.target}</div>
                      <div className="text-xs text-gray-500">
                        {badge.target - badge.progress} more to go!
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Available Badges */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold mb-3">All Available Badges</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(BADGE_DEFINITIONS).map(([id, badge]) => {
            const isEarned = badges.some(b => b.badgeId === id);
            
            return (
              <div
                key={id}
                className={`p-3 rounded text-center ${
                  isEarned ? badge.color : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-medium">{badge.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
