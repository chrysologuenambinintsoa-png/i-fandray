'use client';

import { useState, useEffect } from 'react';
import { UserPlus, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
}

interface FriendSuggestionsCardProps {
  onClose?: () => void;
}

export function FriendSuggestionsCard({ onClose }: FriendSuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/friends/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
      }
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    setSendingRequests(prev => new Set(prev).add(userId));

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: userId }),
      });

      if (response.ok) {
        toast.success('Friend request sent!');
        setSuggestions(prev => prev.filter(suggestion => suggestion.id !== userId));
      } else {
        toast.error('Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
          Friend Suggestions
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close suggestions"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors animate-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <img
              src={suggestion.avatar || 'https://via.placeholder.com/40'}
              alt={`${suggestion.firstName} ${suggestion.lastName}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {suggestion.firstName} {suggestion.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">@{suggestion.username}</p>
            </div>
            <button
              onClick={() => handleSendRequest(suggestion.id)}
              disabled={sendingRequests.has(suggestion.id)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              {sendingRequests.has(suggestion.id) ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href="/friends"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          View all suggestions →
        </a>
      </div>
    </div>
  );
}