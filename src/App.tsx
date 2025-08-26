import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { initializePushNotifications } from './utils/registerServiceWorker';

export default function App() {
  useEffect(() => {
    // Initialize push notifications when the app loads
    initializePushNotifications().catch(error => {
      console.error('Failed to initialize push notifications:', error);
    });
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}
