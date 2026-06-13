/**
 * Push Notifications Hook
 *
 * Manages browser push notification permissions and subscriptions.
 */

import { useState, useEffect, useCallback } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const VAPID_PUBLIC_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY || "").trim();

function getVapidIssue() {
  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY.includes("YOUR_VAPID")) {
    return "Push is not configured on this site (missing VITE_VAPID_PUBLIC_KEY).";
  }
  return null;
}

export function usePushNotifications(studentId) {
  const [permission, setPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );
  const [subscription, setSubscription] = useState(null);
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subscribeToPush = useCallback(async () => {
    const vapidIssue = getVapidIssue();
    if (vapidIssue) {
      setError(vapidIssue);
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      let pushSubscription = await registration.pushManager.getSubscription();

      if (!pushSubscription) {
        try {
          pushSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
        } catch (subscribeErr) {
          if (subscribeErr?.name === "InvalidAccessError") {
            const stale = await registration.pushManager.getSubscription();
            if (stale) await stale.unsubscribe();
            pushSubscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: convertedVapidKey,
            });
          } else {
            throw subscribeErr;
          }
        }
      }

      setSubscription(pushSubscription);

      const response = await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          subscription: pushSubscription.toJSON(),
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || "Could not save subscription on server");
      }

      setError(null);
      return pushSubscription;
    } catch (err) {
      console.error("Error subscribing to push:", err);
      const message =
        err?.message?.includes("applicationServerKey") ||
        err?.name === "InvalidAccessError"
          ? "Push keys on this site do not match the server. Ask your admin to sync VAPID keys."
          : err?.message || "Could not enable browser notifications.";
      setError(message);
      return null;
    }
  }, [studentId]);

  const enableNotifications = useCallback(async () => {
    if (!supported) {
      setError("Push notifications are not supported in this browser.");
      return false;
    }

    const vapidIssue = getVapidIssue();
    if (vapidIssue) {
      setError(vapidIssue);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      let result = permission;
      if (result !== "granted") {
        result = await Notification.requestPermission();
        setPermission(result);
      }

      if (result !== "granted") {
        setError(
          result === "denied"
            ? "Notifications blocked — click the lock icon in the address bar and set Notifications to Allow."
            : "Notification permission was not granted."
        );
        return false;
      }

      const sub = await subscribeToPush();
      return Boolean(sub);
    } catch (err) {
      console.error("Error enabling notifications:", err);
      setError(err?.message || "Could not enable notifications.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, permission, subscribeToPush]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const current = await registration.pushManager.getSubscription();

      if (current) {
        await current.unsubscribe();
      }

      setSubscription(null);

      await fetch(`${API_URL}/api/notifications/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });

      return true;
    } catch (err) {
      console.error("Error unsubscribing:", err);
      setError(err?.message || "Could not turn off notifications.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      typeof Notification !== "undefined";

    setSupported(isSupported);
    if (!isSupported) return;

    setPermission(Notification.permission);

    async function init() {
      try {
        await navigator.serviceWorker.register("/sw.js");
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
          setSubscription(existing);
        } else if (Notification.permission === "granted") {
          await subscribeToPush();
        }
      } catch (err) {
        console.error("Push init failed:", err);
      }
    }

    init();
  }, [subscribeToPush]);

  async function sendTestNotification() {
    if (Notification.permission !== "granted") {
      setError("Enable browser notifications first.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/notifications/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.browser?.sent) {
        setError(
          data?.browser?.error ||
            data?.error ||
            "Test notification failed — make sure notifications are enabled."
        );
      } else {
        setError(null);
      }
    } catch (err) {
      console.error("Error sending test notification:", err);
      setError("Could not reach the server to send a test notification.");
    }
  }

  return {
    supported,
    permission,
    subscription,
    loading,
    error,
    isSubscribed: Boolean(subscription),
    enableNotifications,
    unsubscribe,
    sendTestNotification,
    clearError: () => setError(null),
    // Back-compat alias
    requestPermission: enableNotifications,
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
