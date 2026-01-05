'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useFriendRequestsCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/friends/requests-count');
      if (response.ok) {
        const data = await response.json();
        setCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching friend requests count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCount();
    }
  }, [user]);

  // Refetch every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return { count, loading, refetch: fetchCount };
}