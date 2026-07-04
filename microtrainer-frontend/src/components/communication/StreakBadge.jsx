import { Flame } from "lucide-react";

export default function StreakBadge({ streak }) {
  if (!streak || !streak.currentStreak) return null;

  return (
    <span
      title={`Longest streak: ${streak.longestStreak} day${streak.longestStreak === 1 ? "" : "s"}`}
      className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 px-3 py-1.5 text-sm font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
    >
      <Flame className="h-4 w-4" />
      {streak.currentStreak}-day streak
    </span>
  );
}
