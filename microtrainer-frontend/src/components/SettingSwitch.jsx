/**
 * Accessible toggle switch — checkbox-driven for reliable clicks.
 * Uses dedicated classes so global dark/read-mode bg overrides don't hide the control.
 */
export default function SettingSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <label
      className={`setting-switch relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center ${
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
        className={`setting-switch-track block h-6 w-11 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500 dark:peer-focus-visible:outline-blue-400 ${
          checked ? "setting-switch-track--on" : "setting-switch-track--off"
        }`}
      />
      <span
        aria-hidden
        className={`setting-switch-knob pointer-events-none absolute left-px top-px h-[calc(1.5rem-2px)] w-[calc(1.25rem-2px)] rounded-full transition-transform ${
          checked ? "translate-x-[1.35rem]" : "translate-x-px"
        }`}
      />
    </label>
  );
}
