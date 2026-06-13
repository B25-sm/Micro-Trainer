/**
 * Notification Settings — preferences with auto-save and dark-mode UI.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Mail, ListChecks, Moon } from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import SettingSwitch from "../components/SettingSwitch";
import AppSelect from "../components/AppSelect";
import { getStudentId } from "../utils/studentAuth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const DEFAULT_PREFERENCES = {
  browserNotifications: false,
  emailNotifications: true,
  frequency: "daily",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  notificationTypes: {
    dailyReminders: true,
    streakAlerts: true,
    mockTestReminders: true,
    progressAlerts: true,
    badgeEarned: true,
    assessmentAvailable: true,
  },
};

function getPreferenceUserId() {
  return (
    getStudentId() ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("userName") ||
    ""
  );
}

function mergePreferences(loaded) {
  if (!loaded || typeof loaded !== "object") return { ...DEFAULT_PREFERENCES };
  return {
    ...DEFAULT_PREFERENCES,
    ...loaded,
    notificationTypes: {
      ...DEFAULT_PREFERENCES.notificationTypes,
      ...(loaded.notificationTypes || {}),
    },
  };
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#292a2d] p-6 mb-5 shadow-sm">
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 dark:border-gray-700/80 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0 flex-1 pr-2">
        <div className="font-medium text-gray-900 dark:text-gray-100">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <div className="relative z-10 shrink-0">{children}</div>
    </div>
  );
}

export default function NotificationSettings() {
  const preferenceUserId = getPreferenceUserId();
  const hasUserKey = Boolean(preferenceUserId);

  const {
    supported,
    permission,
    isSubscribed,
    loading: pushLoading,
    error: pushError,
    enableNotifications,
    unsubscribe,
    sendTestNotification,
    clearError: clearPushError,
  } = usePushNotifications(preferenceUserId || "anonymous");

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("idle");
  const preferencesRef = useRef(preferences);
  const readyForAutoSave = useRef(false);

  preferencesRef.current = preferences;

  const updatePreferences = useCallback((updater) => {
    setPreferences((prev) =>
      typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const savePreferences = useCallback(async () => {
    if (!hasUserKey) return false;
    const prefs = preferencesRef.current;
    setSaveStatus("saving");
    try {
      const response = await fetch(
        `${API_URL}/api/notifications/preferences/${encodeURIComponent(preferenceUserId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        }
      );
      if (!response.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
      return true;
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveStatus("error");
      return false;
    }
  }, [hasUserKey, preferenceUserId]);

  useEffect(() => {
    readyForAutoSave.current = false;
    const controller = new AbortController();

    async function load() {
      if (!hasUserKey) {
        setLoading(false);
        readyForAutoSave.current = true;
        return;
      }
      try {
        const response = await fetch(
          `${API_URL}/api/notifications/preferences/${encodeURIComponent(preferenceUserId)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          if (!controller.signal.aborted) {
            setPreferences(mergePreferences(data));
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading preferences:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          readyForAutoSave.current = true;
        }
      }
    }

    load();
    return () => controller.abort();
  }, [hasUserKey, preferenceUserId]);

  useEffect(() => {
    if (!readyForAutoSave.current || loading || !hasUserKey) return;
    const timer = setTimeout(() => {
      savePreferences();
    }, 500);
    return () => clearTimeout(timer);
  }, [preferences, loading, hasUserKey, savePreferences]);

  async function handleBrowserNotificationToggle(enabled) {
    if (pushLoading) return;
    clearPushError();
    try {
      if (enabled) {
        await enableNotifications();
      } else {
        await unsubscribe();
      }
    } catch (error) {
      console.error("Browser notification toggle error:", error);
    }
  }

  useEffect(() => {
    if (!readyForAutoSave.current) return;
    updatePreferences((prev) => ({
      ...prev,
      browserNotifications: isSubscribed,
    }));
  }, [isSubscribed, updatePreferences]);

  const notificationTypeOptions = {
    dailyReminders: {
      label: "Daily practice reminders",
      desc: "Remind you to complete your daily assessment",
    },
    streakAlerts: {
      label: "Streak alerts",
      desc: "When your learning streak is at risk",
    },
    mockTestReminders: {
      label: "Mock test reminders",
      desc: "Scheduled mock test notifications",
    },
    progressAlerts: {
      label: "Progress alerts",
      desc: "Updates on your learning progress",
    },
    badgeEarned: { label: "Badges earned", desc: "When you unlock a new badge" },
    assessmentAvailable: {
      label: "New assessments",
      desc: "When a new assessment is ready",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-[#1a73e8] dark:border-t-[#8ab4f8]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            Notification settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Changes save automatically.
          </p>
        </div>
        {saveStatus === "saving" && (
          <span className="text-sm text-gray-500 dark:text-gray-400">Saving…</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-sm text-green-600 dark:text-green-400">Saved</span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            Could not save — check connection
          </span>
        )}
      </div>

      {!hasUserKey && (
        <div className="mb-5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          Sign in to save notification preferences.
        </div>
      )}

      <SectionCard icon={Bell} title="Browser notifications">
        {!supported ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browser notifications are not supported in this browser.
          </p>
        ) : (
          <>
            <SettingRow
              label="Enable browser notifications"
              description="Alerts even when MicroTrainer is closed"
            >
              <SettingSwitch
                label="Enable browser notifications"
                checked={isSubscribed}
                disabled={pushLoading}
                onChange={handleBrowserNotificationToggle}
              />
            </SettingRow>

            {pushLoading && (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Setting up notifications…
              </p>
            )}

            {pushError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
                {pushError}
              </p>
            )}

            {permission === "denied" && !pushError && (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                Permission denied — enable notifications in your browser settings, then try again.
              </p>
            )}

            {isSubscribed && (
              <button
                type="button"
                onClick={sendTestNotification}
                className="mt-4 text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                Send test notification
              </button>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard icon={Mail} title="Email notifications">
        <SettingRow
          label="Enable email notifications"
          description="Reminders and updates by email"
        >
          <SettingSwitch
            label="Enable email notifications"
            checked={preferences.emailNotifications}
            onChange={(enabled) =>
              updatePreferences((p) => ({ ...p, emailNotifications: enabled }))
            }
          />
        </SettingRow>

        {preferences.emailNotifications && (
          <div className="mt-4">
            <label
              htmlFor="email-frequency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email frequency
            </label>
            <AppSelect
              id="email-frequency"
              value={preferences.frequency}
              onChange={(e) =>
                updatePreferences((p) => ({ ...p, frequency: e.target.value }))
              }
              className="w-full max-w-xs"
            >
              <option value="daily">Daily</option>
              <option value="every2days">Every 2 days</option>
              <option value="weekly">Weekly</option>
            </AppSelect>
          </div>
        )}
      </SectionCard>

      <SectionCard icon={ListChecks} title="Notification types">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Choose what you want to hear about
        </p>
        {Object.entries(notificationTypeOptions).map(([key, { label, desc }]) => (
          <SettingRow key={key} label={label} description={desc}>
            <SettingSwitch
              label={label}
              checked={Boolean(preferences.notificationTypes[key])}
              onChange={(enabled) =>
                updatePreferences((prev) => ({
                  ...prev,
                  notificationTypes: {
                    ...prev.notificationTypes,
                    [key]: enabled,
                  },
                }))
              }
            />
          </SettingRow>
        ))}
      </SectionCard>

      <SectionCard icon={Moon} title="Quiet hours">
        <SettingRow
          label="Enable quiet hours"
          description="Pause notifications during set times"
        >
          <SettingSwitch
            label="Enable quiet hours"
            checked={preferences.quietHoursEnabled}
            onChange={(enabled) =>
              updatePreferences((p) => ({ ...p, quietHoursEnabled: enabled }))
            }
          />
        </SettingRow>

        {preferences.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="quiet-start"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Start
              </label>
              <input
                id="quiet-start"
                type="time"
                value={preferences.quietHoursStart}
                onChange={(e) =>
                  updatePreferences((p) => ({ ...p, quietHoursStart: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="quiet-end"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                End
              </label>
              <input
                id="quiet-end"
                type="time"
                value={preferences.quietHoursEnd}
                onChange={(e) =>
                  updatePreferences((p) => ({ ...p, quietHoursEnd: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#202124] text-gray-900 dark:text-gray-100 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
