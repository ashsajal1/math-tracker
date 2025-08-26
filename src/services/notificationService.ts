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

  // Motivational quotes for study encouragement
  const motivationalQuotes = [
    "Consistency is the key to mastery! Keep your math streak going! 🔥",
    "Every problem you solve makes you better. Let's do some math! 💪",
    "Your future self will thank you for studying today. Keep going! 🚀",
    "Math is not about numbers, equations, or algorithms. It's about understanding. - William Paul Thurston",
    "The only way to learn mathematics is to do mathematics. - Paul Halmos",
    "Don't watch the clock; do what it does. Keep going! ⏰",
    "Small progress is still progress. Keep building your math skills! 📈",
    "The expert in anything was once a beginner. Keep practicing! 🌟",
    "Your daily math practice is an investment in your future self. 💡",
    "Mathematics is the most beautiful and powerful creation of the human spirit. - Stefan Banach"
  ];

  // Get a random quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  // Schedule the notification with the motivational message
  setTimeout(() => {
    showNotification("Time for Math Practice! ✨", {
      ...options,
      body: randomQuote,
      requireInteraction: true
    });
    
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
