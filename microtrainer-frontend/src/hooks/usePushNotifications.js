/**
 * Push Notifications Hook
 * 
 * Manages browser push notification permissions and subscriptions
 */

import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// VAPID public key (you'll need to generate this)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY';

export function usePushNotifications(studentId) {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    setSupported(isSupported);
    
    if (isSupported) {
      setPermission(Notification.permission);
      
      // Register service worker
      registerServiceWorker();
      
      // Check for existing subscription
      checkExistingSubscription();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  async function checkExistingSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        console.log('✅ Existing push subscription found');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function requestPermission() {
    if (!supported) {
      alert('Push notifications are not supported in your browser');
      return false;
    }

    setLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        console.log('✅ Notification permission granted');
        await subscribeToPush();
        return true;
      } else {
        console.log('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Convert VAPID key
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      setSubscription(pushSubscription);
      console.log('✅ Push subscription created:', pushSubscription);

      // Send subscription to backend
      await sendSubscriptionToBackend(pushSubscription);

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }

  async function sendSubscriptionToBackend(pushSubscription) {
    try {
      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          subscription: pushSubscription.toJSON()
        })
      });

      if (response.ok) {
        console.log('✅ Subscription sent to backend');
      } else {
        console.error('❌ Failed to send subscription to backend');
      }
    } catch (error) {
      console.error('Error sending subscription:', error);
    }
  }

  async function unsubscribe() {
    if (!subscription) {
      return;
    }

    setLoading(true);

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      console.log('✅ Unsubscribed from push notifications');

      // Notify backend
      await fetch(`${API_URL}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId })
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function sendTestNotification() {
    if (permission !== 'granted') {
      alert('Please enable notifications first');
      return;
    }

    try {
      await fetch(`${API_URL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId })
      });

      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }

  return {
    supported,
    permission,
    subscription,
    loading,
    isSubscribed: !!subscription,
    requestPermission,
    unsubscribe,
    sendTestNotification
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
