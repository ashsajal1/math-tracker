// Register the service worker for push notifications
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  console.warn('Service workers are not supported in this browser');
  return null;
};

// Request permission for notifications
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notifications are blocked by the user');
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Initialize push notifications
export const initializePushNotifications = async () => {
  try {
    const registration = await registerServiceWorker();
    if (!registration) return null;

    const permission = await requestNotificationPermission();
    if (!permission) return null;

    return registration;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return null;
  }
};
