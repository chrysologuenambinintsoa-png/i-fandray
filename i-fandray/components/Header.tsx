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
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 backdrop-blur-xl bg-opacity-95 border-b border-white/10 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center cursor-pointer group" onClick={() => router.push('/feed')}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                <img src="/logo.svg" alt="i-fandray Logo" className="w-11 h-11 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 relative" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-white transition-all duration-300 group-hover:text-emerald-300">i-fandray</span>
                <span className="text-xs text-emerald-300 font-medium">Social Network</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"></div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t('common.search')} i-fandray...`}
                className="w-full pl-12 pr-4 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition-all duration-300"
                aria-label="Recherche i-fandray"
                title="Recherche i-fandray"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-emerald-300 transition-colors duration-300" />
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-2">
            {/* Home */}
            <button
              onClick={() => router.push('/feed')}
              className="relative p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 hover:bg-emerald-500/30 hover:border-emerald-400 group"
              aria-label={t('navigation.home')}
              title={t('navigation.home')}
            >
              <svg className="w-5 h-5 text-white group-hover:text-emerald-200 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </button>

            {/* Create Post */}
            <button
              onClick={() => router.push('/post/create')}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              aria-label={t('post.createPost')}
              title={t('post.createPost')}
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">{t('post.createPost')}</span>
            </button>

            {/* Messages */}
            <button
              onClick={() => router.push('/messages')}
              className="relative p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 hover:bg-cyan-500/30 hover:border-cyan-400 group"
              aria-label={t('navigation.messages')}
              title={t('navigation.messages')}
            >
              <MessageCircle className="w-5 h-5 text-white group-hover:text-cyan-200 transition-colors duration-300" />
              {messagesUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {messagesUnreadCount > 9 ? '9+' : messagesUnreadCount}
                </span>
              )}
            </button>

            {/* Friends */}
            <button
              onClick={() => router.push('/friends')}
              className="relative p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 hover:bg-purple-500/30 hover:border-purple-400 group"
              aria-label={t('navigation.friends')}
              title={t('navigation.friends')}
            >
              <Users className="w-5 h-5 text-white group-hover:text-purple-200 transition-colors duration-300" />
              {friendRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {friendRequestsCount > 9 ? '9+' : friendRequestsCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 hover:bg-blue-500/30 hover:border-blue-400 group"
              aria-label={t('notifications.title')}
              title={t('notifications.title')}
            >
              <Bell className="w-5 h-5 text-white group-hover:text-blue-200 transition-colors duration-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 transform hover:scale-105 hover:bg-white/20 hover:shadow-lg group"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-white/30 group-hover:ring-emerald-300/50 transition-all duration-300"
                  />
                ) : (
                  <div className="relative w-8 h-8 bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push(`/profile/${user?.username}`);
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center space-x-3 text-white hover:text-emerald-300 transition-all duration-200 rounded-lg mx-2"
                  >
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{t('navigation.profile')}</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 flex items-center space-x-3 text-white hover:text-cyan-300 transition-all duration-200 rounded-lg mx-2"
                  >
                    <Settings className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium">{t('navigation.settings')}</span>
                  </button>

                  <hr className="my-2 border-white/10" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-red-500/20 flex items-center space-x-3 text-red-400 hover:text-red-300 transition-all duration-200 rounded-lg mx-2"
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