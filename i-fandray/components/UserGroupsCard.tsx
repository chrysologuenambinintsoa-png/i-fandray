'use client';

import { useState, useEffect } from 'react';
import { Users, X, Plus, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  isPrivate: boolean;
  createdAt: string;
  _count?: {
    members: number;
    posts: number;
  };
}

interface UserGroupsCardProps {
  onClose?: () => void;
}

export function UserGroupsCard({ onClose }: UserGroupsCardProps) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const fetchUserGroups = async () => {
    try {
      const response = await fetch('/api/groups?creator=true');
      if (response.ok) {
        const data = await response.json();
        setGroups((data.groups || data).slice(0, 3)); // Limit to 3 groups
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-600" />
            Your Groups
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close groups"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven&apos;t created any groups yet</p>
          <Link
            href="/groups"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Group
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-600" />
          Your Groups
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close groups"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {groups.map((group, index) => (
          <div
            key={group.id}
            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors animate-in slide-in-from-left duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="relative">
              <img
                src={group.avatar || 'https://via.placeholder.com/48'}
                alt={group.name}
                className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                <Crown className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <Link
                href={`/groups/${group.id}`}
                className="font-medium text-gray-900 hover:text-green-600 transition-colors block truncate"
              >
                {group.name}
              </Link>
              <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                <span>{group._count?.members || 0} members</span>
                <span>{group._count?.posts || 0} posts</span>
                {group.isPrivate && <span className="text-orange-500">Private</span>}
              </div>
            </div>

            <Link
              href={`/groups/${group.id}`}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              View
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/groups"
          className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
        >
          Manage your groups →
        </Link>
      </div>
    </div>
  );
}