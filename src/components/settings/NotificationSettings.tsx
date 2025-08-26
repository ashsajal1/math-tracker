import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/services/notificationService';

export const NotificationSettings = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(notificationService.isSupported());
    
    // Load saved settings
    const savedTime = localStorage.getItem('notificationTime');
    if (savedTime) {
      setNotificationTime(savedTime);
    }
    
    // Check current permission status
    if (notificationService.hasPermission()) {
      setIsEnabled(true);
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!isEnabled) {
      // Request permission if enabling
      setIsLoading(true);
      const granted = await notificationService.requestPermission();
      if (granted) {
        setIsEnabled(true);
        saveNotificationSettings(true, notificationTime);
      }
      setIsLoading(false);
    } else {
      // Disable notifications
      setIsEnabled(false);
      saveNotificationSettings(false, notificationTime);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setNotificationTime(newTime);
    if (isEnabled) {
      saveNotificationSettings(true, newTime);
    }
  };

  const saveNotificationSettings = (enabled: boolean, time: string) => {
    if (enabled) {
      // Save the time preference
      localStorage.setItem('notificationTime', time);
      
      // Parse the time
      const [hours, minutes] = time.split(':').map(Number);
      
      // Schedule the notification
      notificationService.scheduleDailyNotification(
        { hour: hours, minute: minutes },
        'Time for Math Practice!',
        {
          body: 'Keep up your math streak! Solve some problems today.',
          tag: 'daily-math-reminder'
        }
      );
    } else {
      // Clear any scheduled notifications
      // Note: In a real app, you might want to cancel the scheduled notifications
      localStorage.removeItem('notificationTime');
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
        <p>Push notifications are not supported in your browser or the app is not installed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-lg font-medium">Daily Reminders</h3>
          <p className="text-sm text-muted-foreground">
            Get daily reminders to practice math problems
          </p>
        </div>
        <Switch
          id="enable-notifications"
          checked={isEnabled}
          onCheckedChange={handleToggleNotifications}
          disabled={isLoading}
        />
      </div>

      {isEnabled && (
        <div className="space-y-2">
          <Label htmlFor="notification-time">Reminder Time</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="notification-time"
              type="time"
              value={notificationTime}
              onChange={handleTimeChange}
              className="max-w-[180px]"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => notificationService.showNotification(
                'Test Notification',
                { body: 'This is a test notification from Math Tracker' }
              )}
              disabled={isLoading}
            >
              Test Notification
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            You'll receive a daily reminder at this time
          </p>
        </div>
      )}
    </div>
  );
};
