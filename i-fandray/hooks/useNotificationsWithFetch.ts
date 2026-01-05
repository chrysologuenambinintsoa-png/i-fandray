'use client';

import { useEffect } from 'react';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';

export function useNotificationsWithFetch() {
  const { user } = useAuth();
  const { fetchNotifications, ...notificationsStore } = useNotifications();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    ...notificationsStore,
    fetchNotifications,
  };
}