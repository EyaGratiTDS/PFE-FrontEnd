import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/home-styles.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { webNotificationsService } from './services/api';
import { useAuth } from './context/AuthContext';

// --- SW update ---
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available! Reload to update?')) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline use');
  },
});

// --- Utils ---
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// --- Push notification logic ---
export const requestNotificationPermission = async () => {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported in this browser');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    console.log('Notification permission granted');

    const registration = await navigator.serviceWorker.ready;

    const VAPID_PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });
    }

    const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(
          String.fromCharCode(
            ...new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))
          )
        ),
        auth: btoa(
          String.fromCharCode(
            ...new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))
          )
        ),
      },
      expirationTime: subscription.expirationTime,
    };

    await webNotificationsService.addWebNotification(subscriptionObject);
  } catch (error) {
    console.error('Error during push subscription:', error);
  }
};

// --- Wrapper that checks auth before requesting notifications ---
const NotificationInitializer = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User is authenticated → init push notifications');
      requestNotificationPermission();
    } else {
      console.log('User not authenticated → skip push subscription');
    }
  }, [isAuthenticated, isLoading]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <NotificationInitializer />
  </StrictMode>
);
