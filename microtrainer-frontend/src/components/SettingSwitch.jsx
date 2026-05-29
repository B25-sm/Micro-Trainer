/**
 * Accessible toggle switch — checkbox-driven for reliable clicks.
 */
export default function SettingSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <label
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={Boolean(checked)}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          if (disabled) return;
          onChange(e.target.checked);
        }}
      />
      <span
        aria-hidden
        className={`block h-6 w-11 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 dark:peer-focus-visible:outline-blue-400 ${
          checked ? "bg-[#1a73e8] dark:bg-[#8ab4f8]" : "bg-gray-300 dark:bg-gray-600"
        }`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </label>
  );
}
