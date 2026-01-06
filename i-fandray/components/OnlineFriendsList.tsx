'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useTranslation } from '@/components/TranslationProvider';
import { User } from '@/types';

interface OnlineFriendsListProps {
  className?: string;
}

export function OnlineFriendsList({ className = '' }: OnlineFriendsListProps) {
  const { privacy } = useSettings();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [onlineFriends, setOnlineFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchOnlineFriends = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/friends/online');
      if (response.ok) {
        const data = await response.json();
        setOnlineFriends(data.friends);
      }
    } catch (error) {
      console.error('Error fetching online friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && privacy.showOnlineStatus) {
      fetchOnlineFriends();
      
      // Set up SSE for real-time online status updates
      const eventSource = new EventSource('/api/notifications/sse');
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'online_status_update') {
            const { userId, isOnline } = data.data;
            
            setOnlineFriends(prev => {
              if (isOnline) {
                // Add user to online list if not already there
                const isAlreadyOnline = prev.some(friend => friend.id === userId);
                if (!isAlreadyOnline) {
                  // We need to fetch the user data, but for now we'll just refresh
                  fetchOnlineFriends();
                }
                return prev;
              } else {
                // Remove user from online list
                return prev.filter(friend => friend.id !== userId);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
      };

      // Refresh online friends list every 30 seconds as backup
      const interval = setInterval(fetchOnlineFriends, 30000);
      
      return () => {
        clearInterval(interval);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      };
    }
  }, [user, privacy.showOnlineStatus]);

  // Don't show if user disabled online status
  if (!privacy.showOnlineStatus) {
    return null;
  }

  if (!user || onlineFriends.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex -space-x-2">
        {onlineFriends.slice(0, 5).map((friend) => (
          <div
            key={friend.id}
            className="relative w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden hover:z-10 transition-transform hover:scale-110"
            title={`${friend.firstName} ${friend.lastName} - En ligne`}
          >
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={`${friend.firstName} ${friend.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                {friend.firstName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          </div>
        ))}
      </div>

      {onlineFriends.length > 5 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300">
          +{onlineFriends.length - 5}
        </div>
      )}

      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
        {onlineFriends.length} ami{onlineFriends.length > 1 ? 's' : ''} en ligne
      </span>
    </div>
  );
}