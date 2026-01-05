'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, MessageCircle, Plus, LogOut, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useNotificationsWithFetch } from '@/hooks/useNotificationsWithFetch';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { useFriendRequestsCount } from '@/hooks/useFriendRequestsCount';
import { useTranslation } from '@/components/TranslationProvider';
import { NotificationsPanel } from '@/components/NotificationsPanel';
import { OnlineFriendsList } from '@/components/OnlineFriendsList';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language } = useSettings();
  const { unreadCount } = useNotificationsWithFetch();
  const { unreadCount: messagesUnreadCount } = useUnreadMessagesCount();
  const { count: friendRequestsCount } = useFriendRequestsCount();
  const { t } = useTranslation();

  // Enable real-time notifications
  useRealtimeNotifications();

  // Manage online status
  useOnlineStatus();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 header-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => router.push('/feed')}>
            <div className="flex items-center space-x-3">
              <img src="/logo.svg" alt="i-fandray Logo" className="w-10 h-10" />
              <span className="text-xl font-bold">i-fandray</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('common.search')} i-fandray...`}
                className="w-full pl-10 pr-4 py-2 glass rounded-full border-none focus:outline-none focus:ring-2 focus:ring-green-300 placeholder:text-inherit/80 text-inherit"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Home */}
            <button
              onClick={() => router.push('/feed')}
              className="p-2 rounded-full transition-transform transform hover:scale-105"
              aria-label={t('navigation.home')}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>

            {/* Create Post */}
            <button
              onClick={() => router.push('/post/create')}
              className="p-2 rounded-full transition-transform transform hover:scale-105"
              aria-label={t('post.createPost')}
            >
              <Plus className="w-6 h-6" />
            </button>

            {/* Messages */}
            <button
              onClick={() => router.push('/messages')}
              className="relative p-2 rounded-full transition-transform transform hover:scale-105"
              aria-label={t('navigation.messages')}
            >
              <MessageCircle className="w-6 h-6" />
              {messagesUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {messagesUnreadCount > 9 ? '9+' : messagesUnreadCount}
                </span>
              )}
            </button>

            {/* Friends */}
            <button
              onClick={() => router.push('/friends')}
              className="relative p-2 rounded-full transition-transform transform hover:scale-105"
              aria-label={t('navigation.friends')}
            >
              <Users className="w-6 h-6" />
              {friendRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequestsCount > 9 ? '9+' : friendRequestsCount}
                </span>
              )}
            </button>

            {/* Online Friends List */}
            <OnlineFriendsList className="hidden lg:flex" />

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full transition-transform transform hover:scale-105"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1 rounded-full transition-transform transform hover:scale-105"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push(`/profile/${user?.username}`);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t('navigation.profile')}</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-gray-900"
                  >
                    <Settings className="w-4 h-4" />
                    <span>{t('navigation.settings')}</span>
                  </button>

                  <hr className="my-2 border-gray-200" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </header>
  );
}