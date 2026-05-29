/**
 * Engagement Dashboard Page
 * 
 * Main dashboard for student engagement with real-time updates
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import StatusBanner from '../components/engagement/StatusBanner';
import TodaysSummary from '../components/engagement/TodaysSummary';
import StreakTracker from '../components/engagement/StreakTracker';
import MiniAssessmentCard from '../components/engagement/MiniAssessmentCard';
import PerformanceAnalytics from '../components/engagement/PerformanceAnalytics';
import BadgeDisplay from '../components/engagement/BadgeDisplay';
import SyncRequiredBanner from '../components/SyncRequiredBanner';
import { getStudentHeaders, getStudentId } from '../utils/studentAuth';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function EngagementDashboard() {
  const [studentId] = useState(getStudentId() || 'student123');
  const [engagementData, setEngagementData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [badges, setBadges] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // WebSocket connection for real-time updates
  const { connected, on } = useWebSocket(studentId, 'student');

  // Fetch initial data
  useEffect(() => {
    fetchEngagementData();
    fetchStreakData();
    fetchTodayAssessment();
    fetchAnalytics();
    fetchBadges();
    fetchSyncStatus();
  }, [studentId]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!connected) return;

    // Status updates
    const unsubStatus = on('status:update', (data) => {
      console.log('Status update received:', data);
      setEngagementData(prev => ({
        ...prev,
        status: data.status,
        todaySummary: data.todaySummary
      }));
    });

    // Activity completed
    const unsubActivity = on('activity:completed', (data) => {
      console.log('Activity completed:', data);
      fetchEngagementData(); // Refresh data
    });

    // Streak updated
    const unsubStreak = on('streak:updated', (data) => {
      console.log('Streak updated:', data);
      fetchStreakData(); // Refresh streak
    });

    // Badge earned
    const unsubBadge = on('badge:earned', (data) => {
      console.log('Badge earned:', data);
      // Show notification
      showNotification(`Badge earned: ${data.badgeName}`);
    });

    // Assessment available
    const unsubAssessment = on('assessment:available', (data) => {
      console.log('New assessment available:', data);
      fetchTodayAssessment();
    });

    return () => {
      unsubStatus?.();
      unsubActivity?.();
      unsubStreak?.();
      unsubBadge?.();
      unsubAssessment?.();
    };
  }, [connected, on]);

  async function fetchEngagementData() {
    try {
      const response = await fetch(`${API_URL}/api/engagement/status/${studentId}`);
      const data = await response.json();
      setEngagementData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching engagement data:', error);
      setLoading(false);
    }
  }

  async function fetchStreakData() {
    try {
      const response = await fetch(`${API_URL}/api/engagement/streak/${studentId}`);
      const data = await response.json();
      setStreakData(data);
    } catch (error) {
      console.error('Error fetching streak data:', error);
    }
  }

  async function fetchTodayAssessment() {
    try {
      const technology = engagementData?.activeTechnology || 'JavaScript';
      const response = await fetch(`${API_URL}/api/assessment/mini-assessment/${studentId}?technology=${technology}`);
      const data = await response.json();
      setAssessment(data);
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  }

  async function fetchAnalytics() {
    try {
      const response = await fetch(`${API_URL}/api/analytics/dashboard/${studentId}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }

  async function fetchBadges() {
    try {
      const response = await fetch(`${API_URL}/api/badges/${studentId}`);
      const data = await response.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  }

  async function fetchSyncStatus() {
    try {
      const response = await fetch(`${API_URL}/api/sync/status/${studentId}`, {
        headers: getStudentHeaders(studentId),
      });
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
      setSyncStatus({ officialBenefitsEnabled: false });
    }
  }

  function showNotification(message) {
    // Simple notification - can be replaced with a toast library
    alert(message);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#202124] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-[#1a73e8] dark:border-t-[#8ab4f8] mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#202124] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100 tracking-tight">Engagement</h1>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'} mr-2`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <SyncRequiredBanner studentId={studentId} />

        <StatusBanner
          status={engagementData?.status || 'Inactive'}
          streak={engagementData?.streak || 0}
          engagementScore={engagementData?.engagementScore || 0}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TodaysSummary summary={engagementData?.todaySummary} />
            <MiniAssessmentCard assessment={assessment} />
            <PerformanceAnalytics analytics={analytics} />
          </div>

          <div>
            <StreakTracker streakData={streakData} />
            <BadgeDisplay 
              badges={badges} 
              currentStreak={engagementData?.streak || 0}
              totalActivities={engagementData?.todaySummary?.activitiesCompleted || 0}
              syncStatus={syncStatus}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
