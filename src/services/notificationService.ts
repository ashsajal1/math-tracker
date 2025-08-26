// Notification service for handling push notifications

interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

// Check if the browser supports service workers and notifications
const isSupported = () => {
  return 'serviceWorker' in navigator && 'Notification' in window;
};

// Request permission for notifications
const requestPermission = async (): Promise<boolean> => {
  if (!isSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Check if notifications are permitted
const hasPermission = (): boolean => {
  return Notification.permission === 'granted';
};

// Show a notification
const showNotification = (title: string, options?: ExtendedNotificationOptions) => {
  if (!hasPermission()) {
    console.warn('Cannot show notification: No permission');
    return;
  }

  // Use the service worker registration to show the notification
  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, {
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      vibrate: [200, 100, 200],
      ...options
    });
  });
};

// Schedule a daily notification
const scheduleDailyNotification = async (time: { hour: number; minute: number }, title: string, options?: NotificationOptions) => {
  if (!hasPermission()) {
    const granted = await requestPermission();
    if (!granted) return;
  }

  // Calculate the time until the next scheduled notification
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(time.hour, time.minute, 0, 0);
  
  // If the time has already passed today, schedule for tomorrow
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const timeUntilNotification = scheduledTime.getTime() - now.getTime();

  // Schedule the notification
  setTimeout(() => {
    showNotification(title, options);
    
    // Schedule the next day's notification
    scheduleDailyNotification(time, title, options);
  }, timeUntilNotification);
};

export const notificationService = {
  isSupported,
  requestPermission,
  hasPermission,
  showNotification,
  scheduleDailyNotification,
};
