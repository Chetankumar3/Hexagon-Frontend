import API_CONFIG from "../config/api";

function authHeaders() {
  const token =
    localStorage.getItem("hexagon_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Convert VAPID key from base64 URL-safe to Uint8Array
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

// Register service worker
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Subscribe to push notifications
export async function subscribeToPush() {
  try {
    // Get VAPID public key from server
    const keyRes = await fetch(API_CONFIG.getApiUrl("/push/public-key"));
    if (!keyRes.ok) {
      throw new Error("Failed to get VAPID public key");
    }
    const { publicKey } = await keyRes.json();

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error("Service Worker not available");
    }

    // Request notification permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error("Notification permission denied");
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to server
    const subRes = await fetch(API_CONFIG.getApiUrl("/push/subscribe"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))
          ),
        },
      }),
    });

    if (!subRes.ok) {
      throw new Error("Failed to subscribe on server");
    }

    console.log("Successfully subscribed to push notifications");
    return true;
  } catch (error) {
    console.error("Push subscription error:", error);
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      // Unsubscribe from push service
      await subscription.unsubscribe();

      // Remove from server
      await fetch(API_CONFIG.getApiUrl("/push/unsubscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      console.log("Successfully unsubscribed from push notifications");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Push unsubscribe error:", error);
    return false;
  }
}

// Check if user is subscribed
export async function isSubscribed() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    return false;
  }
}

