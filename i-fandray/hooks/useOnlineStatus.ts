'use client';

import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { prisma } from '@/lib/prisma';

export function useOnlineStatus() {
  const { user } = useAuth();

  const updateOnlineStatus = useCallback(async (isOnline: boolean) => {
    if (!user) return;

    try {
      await fetch('/api/users/online-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline }),
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [user]);

  const setOnline = useCallback(() => updateOnlineStatus(true), [updateOnlineStatus]);
  const setOffline = useCallback(() => updateOnlineStatus(false), [updateOnlineStatus]);

  useEffect(() => {
    if (!user) return;

    // Set user as online when component mounts
    setOnline();

    // Set user as offline when component unmounts or page is closed
    const handleBeforeUnload = () => {
      setOffline();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setOffline();
    };
  }, [user, setOnline, setOffline]);

  return { setOnline, setOffline };
}