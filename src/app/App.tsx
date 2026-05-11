import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { DocumentProvider } from './context/DocumentContext';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { initOfflineSync, syncOfflineQueue } from '../services/offlineSyncService';

export default function App() {
  useEffect(() => {
    // Initialize the event listener for network changes
    initOfflineSync();

    // Try to sync immediately on app load if the user is already online
    if (navigator.onLine) {
      syncOfflineQueue();
    }
  }, []);

  return (
    <AuthProvider>
      <DocumentProvider>
        <RouterProvider router={router} />
        <Toaster />
      </DocumentProvider>
    </AuthProvider>
  );
}