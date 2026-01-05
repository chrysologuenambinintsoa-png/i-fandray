'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Page {
  id: string;
  name: string;
  description?: string;
  category: string;
  website?: string;
  avatar?: string;
  coverPhoto?: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  _count?: {
    followers: number;
    posts?: number;
  };
  isFollowing?: boolean;
}

interface DiscoverPagesCardProps {
  onClose?: () => void;
}

export function DiscoverPagesCard({ onClose }: DiscoverPagesCardProps) {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingPages, setFollowingPages] = useState<Set<string>>(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchDiscoverPages();
  }, []);

  const fetchDiscoverPages = async () => {
    try {
      const response = await fetch('/api/pages?discover=true&limit=20');
      if (response.ok) {
        const data = await response.json();
        // Filter out user's own pages and limit to 10
        const filteredPages = data.filter((page: Page) => page.creator.id !== user?.id).slice(0, 10);
        setPages(filteredPages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (pageId: string) => {
    if (followingPages.has(pageId)) {
      // Unfollow
      try {
        const response = await fetch(`/api/pages/${pageId}/follow`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setFollowingPages(prev => {
            const newSet = new Set(prev);
            newSet.delete(pageId);
            return newSet;
          });
          setPages(prev => prev.map(page =>
            page.id === pageId
              ? { ...page, _count: { ...page._count, followers: (page._count?.followers || 0) - 1 } }
              : page
          ));
          toast.success('Unfollowed page');
        }
      } catch (error) {
        toast.error('Failed to unfollow page');
      }
    } else {
      // Follow
      try {
        const response = await fetch(`/api/pages/${pageId}/follow`, {
          method: 'POST',
        });

        if (response.ok) {
          setFollowingPages(prev => new Set(prev).add(pageId));
          setPages(prev => prev.map(page =>
            page.id === pageId
              ? { ...page, _count: { ...page._count, followers: (page._count?.followers || 0) + 1 } }
              : page
          ));
          toast.success('Following page');
        }
      } catch (error) {
        toast.error('Failed to follow page');
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('pages-scroll-container');
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

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-purple-600" />
          Discover Pages
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close pages"
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
          id="pages-scroll-container"
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
        >
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex-shrink-0 w-72 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={page.avatar || 'https://via.placeholder.com/40'}
                      alt={page.name}
                      className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                      <FileText className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/pages/${page.id}`}
                      className="font-medium text-gray-900 hover:text-purple-600 transition-colors block truncate text-sm"
                    >
                      {page.name}
                    </Link>
                    <p className="text-xs text-gray-500 capitalize">{page.category}</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2 mb-3 h-8">
                {page.description || 'No description available'}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{page._count?.followers || 0} followers</span>
                <span>{page._count?.posts || 0} posts</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleFollow(page.id)}
                  className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                    followingPages.has(page.id)
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>{followingPages.has(page.id) ? 'Following' : 'Follow'}</span>
                </button>

                <Link
                  href={`/pages/${page.id}`}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <ExternalLink className="w-3 h-3" />
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