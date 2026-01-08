'use client';

import React, { useState, useEffect } from 'react';
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
    <header className="fixed top-0 left-0 right-0 z-40 header-glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => router.push('/feed')}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.svg" alt="i-fandray Logo" className="w-10 h-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 group-hover:from-blue-300 group-hover:via-green-300 group-hover:to-teal-300 transition-all duration-300">i-fandray</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('common.search')} i-fandray...`}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all duration-300"
                aria-label="Recherche i-fandray"
                title="Recherche i-fandray"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 group-focus-within:text-white transition-colors duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-6">
            {/* Home */}
            <button
              onClick={() => router.push('/feed')}
              className="relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:shadow-lg group"
              aria-label={t('navigation.home')}
            >
              <svg className="w-6 h-6 text-white group-hover:text-blue-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Create Post */}
            <button
              onClick={() => router.push('/post/create')}
              className="btn-personal hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              aria-label={t('post.createPost')}
              title={t('post.createPost')}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">{t('post.createPost')}</span>
            </button>

            {/* Messages */}
            <button
              onClick={() => router.push('/messages')}
              className="relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:shadow-lg group"
              aria-label={t('navigation.messages')}
            >
              <MessageCircle className="w-6 h-6 text-white group-hover:text-green-300 transition-colors duration-300" />
              {messagesUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {messagesUnreadCount > 9 ? '9+' : messagesUnreadCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Friends */}
            <button
              onClick={() => router.push('/friends')}
              className="relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:shadow-lg group"
              aria-label={t('navigation.friends')}
            >
              <Users className="w-6 h-6 text-white group-hover:text-blue-300 transition-colors duration-300" />
              {friendRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {friendRequestsCount > 9 ? '9+' : friendRequestsCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Online Friends List */}
            <OnlineFriendsList className="hidden lg:flex" />

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:shadow-lg group"
            >
              <Bell className="w-6 h-6 text-white group-hover:text-teal-300 transition-colors duration-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-110 hover:bg-white/20 hover:shadow-lg group"
              >
                {user?.avatar ? (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="relative w-9 h-9 bg-gradient-to-br from-blue-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg ring-2 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                    {user?.firstName?.[0] || 'U'}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 py-3 z-50">
                  <button
                    onClick={() => {
                      router.push(`/profile/${user?.username}`);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 flex items-center space-x-3 text-gray-900 hover:text-blue-700 transition-all duration-200 rounded-lg mx-2"
                  >
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{t('navigation.profile')}</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 flex items-center space-x-3 text-gray-900 hover:text-green-700 transition-all duration-200 rounded-lg mx-2"
                  >
                    <Settings className="w-5 h-5 text-green-500" />
                    <span className="font-medium">{t('navigation.settings')}</span>
                  </button>

                  <hr className="my-3 border-gray-200/50" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center space-x-3 text-red-600 hover:text-red-700 transition-all duration-200 rounded-lg mx-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('auth.logout')}</span>
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