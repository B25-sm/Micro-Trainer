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
    { label: 'Activities', value: activitiesCompleted },
    { label: 'Time spent', value: `${timeSpent} min` },
    { label: 'Assessments', value: assessmentsTaken },
    { label: 'Avg score', value: `${Math.round(averageScore)}%` },
  ];

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Today&apos;s summary</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#202124]/50">
            <div className="text-xl font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {metric.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metric.label}</div>
          </div>
        ))}
      </div>
      
      {technologiesPracticed.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Technologies practiced</div>
          <div className="flex flex-wrap gap-2">
            {technologiesPracticed.map((tech, index) => (
              <span
                key={index}
                className="px-2.5 py-0.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
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
