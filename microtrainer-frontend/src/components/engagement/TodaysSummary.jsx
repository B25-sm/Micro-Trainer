/**
 * Today's Summary Component
 * 
 * Shows today's activity metrics with real-time updates
 */

export default function TodaysSummary({ summary }) {
  const {
    activitiesCompleted = 0,
    timeSpent = 0,
    assessmentsTaken = 0,
    averageScore = 0,
    technologiesPracticed = []
  } = summary || {};

  const metrics = [
    {
      icon: '📝',
      label: 'Activities',
      value: activitiesCompleted,
      color: 'text-blue-600'
    },
    {
      icon: '⏱️',
      label: 'Time Spent',
      value: `${timeSpent} min`,
      color: 'text-green-600'
    },
    {
      icon: '✅',
      label: 'Assessments',
      value: assessmentsTaken,
      color: 'text-purple-600'
    },
    {
      icon: '📊',
      label: 'Avg Score',
      value: `${Math.round(averageScore)}%`,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Today's Summary</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl mb-2">{metric.icon}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
      
      {technologiesPracticed.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Technologies Practiced:</div>
          <div className="flex flex-wrap gap-2">
            {technologiesPracticed.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
