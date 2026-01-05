'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!user) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    // Create EventSource for real-time notifications
    const eventSource = new EventSource('/api/notifications/sse');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          // Add new notification to the store
          const notification = {
            ...data.data,
            createdAt: new Date(data.data.createdAt),
          };
          addNotification(notification);
        }
        // unread_count is handled automatically by the store when notifications are added/removed
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          eventSource.close();
          eventSourceRef.current = null;
          // The useEffect will recreate the connection
        }
      }, 5000);
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened for notifications');
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, addNotification]);
}