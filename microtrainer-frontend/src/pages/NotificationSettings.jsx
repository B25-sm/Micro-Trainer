/**
 * Notification Settings Page
 * 
 * Allows students to manage notification preferences
 */

import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function NotificationSettings() {
  const studentId = localStorage.getItem('studentId') || 'student123';
  
  const {
    supported,
    permission,
    isSubscribed,
    loading: pushLoading,
    requestPermission,
    unsubscribe,
    sendTestNotification
  } = usePushNotifications(studentId);

  const [preferences, setPreferences] = useState({
    browserNotifications: false,
    emailNotifications: true,
    frequency: 'daily',
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationTypes: {
      dailyReminders: true,
      streakAlerts: true,
      mockTestReminders: true,
      progressAlerts: true,
      badgeEarned: true,
      assessmentAvailable: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      browserNotifications: isSubscribed
    }));
  }, [isSubscribed]);

  async function loadPreferences() {
    try {
      const response = await fetch(`${API_URL}/api/notifications/preferences/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  async function savePreferences() {
    setLoading(true);
    setSaved(false);

    try {
      const response = await fetch(`${API_URL}/api/notifications/preferences/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  }

  async function handleBrowserNotificationToggle() {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await requestPermission();
    }
  }

  function handleNotificationTypeToggle(type) {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [type]: !prev.notificationTypes[type]
      }
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-2">Manage how and when you receive notifications</p>
        </div>

        {/* Browser Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🔔 Browser Notifications</h2>
          
          {!supported && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <p className="text-yellow-700">
                ⚠️ Browser notifications are not supported in your browser.
              </p>
            </div>
          )}

          {supported && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">Enable Browser Notifications</div>
                  <div className="text-sm text-gray-600">
                    Receive push notifications even when the app is closed
                  </div>
                </div>
                <button
                  onClick={handleBrowserNotificationToggle}
                  disabled={pushLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isSubscribed ? 'bg-blue-600' : 'bg-gray-300'
                  } ${pushLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSubscribed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {isSubscribed && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <p className="text-green-700">
                    ✅ Browser notifications are enabled
                  </p>
                </div>
              )}

              {permission === 'denied' && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <p className="text-red-700">
                    ❌ Notification permission denied. Please enable notifications in your browser settings.
                  </p>
                </div>
              )}

              {isSubscribed && (
                <button
                  onClick={sendTestNotification}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Send Test Notification
                </button>
              )}
            </>
          )}
        </div>

        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📧 Email Notifications</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">Enable Email Notifications</div>
              <div className="text-sm text-gray-600">
                Receive reminders and updates via email
              </div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.emailNotifications && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Frequency
              </label>
              <select
                value={preferences.frequency}
                onChange={(e) => setPreferences(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full border rounded px-3 py-2"
              >
                <option value="daily">Daily</option>
                <option value="every2days">Every 2 Days</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          )}
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📋 Notification Types</h2>
          <p className="text-sm text-gray-600 mb-4">Choose which notifications you want to receive</p>
          
          <div className="space-y-4">
            {Object.entries({
              dailyReminders: { label: 'Daily Practice Reminders', desc: 'Reminders to complete your daily assessment' },
              streakAlerts: { label: 'Streak Alerts', desc: 'Alerts when your streak is at risk' },
              mockTestReminders: { label: 'Mock Test Reminders', desc: 'Reminders for scheduled mock tests' },
              progressAlerts: { label: 'Progress Alerts', desc: 'Alerts about your learning progress' },
              badgeEarned: { label: 'Badge Earned', desc: 'Notifications when you earn new badges' },
              assessmentAvailable: { label: 'Assessment Available', desc: 'Notifications when new assessments are ready' }
            }).map(([key, { label, desc }]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-gray-600">{desc}</div>
                </div>
                <button
                  onClick={() => handleNotificationTypeToggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.notificationTypes[key] ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.notificationTypes[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">🌙 Quiet Hours</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium">Enable Quiet Hours</div>
              <div className="text-sm text-gray-600">
                Don't send notifications during specific hours
              </div>
            </div>
            <button
              onClick={() => setPreferences(prev => ({ ...prev, quietHoursEnabled: !prev.quietHoursEnabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.quietHoursEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.quietHoursEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => setPreferences(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => setPreferences(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          {saved && (
            <div className="flex items-center text-green-600">
              <span className="mr-2">✅</span>
              <span>Preferences saved!</span>
            </div>
          )}
          <button
            onClick={savePreferences}
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
