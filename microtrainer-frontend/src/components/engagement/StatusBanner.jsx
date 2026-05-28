/**
 * Status Banner Component
 * 
 * Displays student's current engagement status with real-time updates
 */

const statusConfig = {
  Active: {
    color: 'bg-green-500',
    icon: '🟢',
    text: 'Active',
    description: 'Great job! Keep up the momentum'
  },
  Excelling: {
    color: 'bg-blue-500',
    icon: '⭐',
    text: 'Excelling',
    description: 'Outstanding performance!'
  },
  At_Risk: {
    color: 'bg-yellow-500',
    icon: '⚠️',
    text: 'At Risk',
    description: 'Practice needed to maintain streak'
  },
  Inactive: {
    color: 'bg-red-500',
    icon: '🔴',
    text: 'Inactive',
    description: 'Time to get back on track!'
  }
};

export default function StatusBanner({ status, streak, engagementScore }) {
  const config = statusConfig[status] || statusConfig.Inactive;

  return (
    <div className={`${config.color} text-white rounded-lg p-6 shadow-lg mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-4xl">{config.icon}</span>
          <div>
            <h2 className="text-2xl font-bold">{config.text}</h2>
            <p className="text-sm opacity-90">{config.description}</p>
          </div>
        </div>
        
        <div className="flex space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold">🔥 {streak}</div>
            <div className="text-sm opacity-90">Day Streak</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold">{engagementScore}</div>
            <div className="text-sm opacity-90">Engagement Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
