'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Lock, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  isPrivate: boolean;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  _count?: {
    members: number;
    posts?: number;
  };
  isMember?: boolean;
}

interface DiscoverGroupsCardProps {
  onClose?: () => void;
}

export function DiscoverGroupsCard({ onClose }: DiscoverGroupsCardProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningGroups, setJoiningGroups] = useState<Set<string>>(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchDiscoverGroups();
  }, []);

  const fetchDiscoverGroups = async () => {
    try {
      const response = await fetch('/api/groups?discover=true&limit=20');
      if (response.ok) {
        const data = await response.json();
        // Filter out user's own groups and limit to 10
        const filteredGroups = (data.groups || data)
          .filter((group: Group) => group.creator.id !== user?.id)
          .slice(0, 10);
        setGroups(filteredGroups);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    setJoiningGroups(prev => new Set(prev).add(groupId));

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setGroups(prev => prev.map(group =>
          group.id === groupId
            ? { ...group, _count: { ...group._count, members: (group._count?.members || 0) + 1 }, isMember: true }
            : group
        ));
        toast.success('Joined group successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    } finally {
      setJoiningGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleLeave = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        setGroups(prev => prev.map(group =>
          group.id === groupId
            ? { ...group, _count: { ...group._count, members: (group._count?.members || 0) - 1 }, isMember: false }
            : group
        ));
        toast.success('Left group successfully!');
      } else {
        toast.error('Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('groups-scroll-container');
    if (container) {
      const scrollAmount = 320; // Width of one card + gap
      const newPosition = direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-72">
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Discover Groups
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close groups"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="relative">
        {/* Left scroll button */}
        {scrollPosition > 0 && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Right scroll button */}
        <div
          id="groups-scroll-container"
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={group.avatar || 'https://via.placeholder.com/40'}
                      alt={group.name}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                      <Crown className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/groups/${group.id}`}
                      className="font-medium text-gray-900 hover:text-green-600 transition-colors block truncate text-sm"
                    >
                      {group.name}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <p className="text-xs text-gray-500">by {group.creator.firstName}</p>
                      {group.isPrivate && <Lock className="w-3 h-3 text-orange-500" />}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-3 h-8">
                {group.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{group._count?.members || 0} members</span>
                <span>{group._count?.posts || 0} posts</span>
              </div>

              <div className="flex space-x-2">
                {group.isMember ? (
                  <button
                    onClick={() => handleLeave(group.id)}
                    className="flex-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-1"
                  >
                    <span>Leave</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(group.id)}
                    disabled={joiningGroups.has(group.id)}
                    className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
                  >
                    {joiningGroups.has(group.id) ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                )}

                <Link
                  href={`/groups/${group.id}`}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}