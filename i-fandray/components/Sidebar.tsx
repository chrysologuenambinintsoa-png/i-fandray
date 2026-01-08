'use client';

import { Home, Users, Newspaper, Video, Settings, MessageSquare, User, HelpCircle, ChevronLeft, ChevronRight, Search, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import { useEffect } from 'react';

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage = 'home' }: SidebarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'vibrant' | 'minimal'>('vibrant');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setCollapsed((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const menuItems = [
    {
      icon: Home,
      label: t('navigation.home'),
      href: '/feed',
      id: 'home',
    },
    {
      icon: Search,
      label: t('common.search'),
      href: '/search',
      id: 'search',
    },
    {
      icon: User,
      label: t('navigation.profile'),
      href: `/profile/${user?.username}`,
      id: 'profile',
    },
    {
      icon: MessageSquare,
      label: t('navigation.messages'),
      href: '/messages',
      id: 'messages',
    },
    {
      icon: Users,
      label: t('navigation.friends'),
      href: '/friends',
      id: 'friends',
    },
    {
      icon: Users,
      label: t('navigation.groups'),
      href: '/groups',
      id: 'groups',
    },
    {
      icon: Video,
      label: t('navigation.live'),
      href: '/live',
      id: 'live',
    },
    {
      icon: Video,
      label: t('navigation.video'),
      href: '/videos',
      id: 'videos',
    },
  ];

  const bottomMenuItems = [
    {
      icon: Settings,
      label: t('navigation.settings'),
      href: '/settings',
      id: 'settings',
    },
    {
      icon: HelpCircle,
      label: t('navigation.help'),
      href: '/help',
      id: 'help',
    },
  ];

  return (
    <aside className={cn(
      'fixed left-0 top-16 bottom-0 overflow-y-auto hidden lg:block transition-all duration-500 ease-in-out shadow-2xl border-r',
      theme === 'vibrant' ? 'sidebar-colored border-white/10' : 'bg-gray-900/60 border-white/6',
      collapsed ? 'w-20' : 'w-72'
    )}>
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {!collapsed && (
              <span className={cn('font-bold text-xl', theme === 'vibrant' ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 animate-pulse' : 'text-white')}>
                i-fandray
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTheme((t) => (t === 'vibrant' ? 'minimal' : 'vibrant'))}
              className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'vibrant' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'p-3 rounded-2xl backdrop-blur-sm border transition-all duration-300 transform hover:scale-110 hover:shadow-lg group',
                theme === 'vibrant' ? 'bg-gradient-to-r from-blue-500/20 to-green-500/20 border-white/20 hover:from-blue-500/30 hover:to-green-500/30' : 'bg-white/5 border-white/10 hover:bg-white/6'
              )}
              aria-label="Toggle sidebar"
              title="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="w-6 h-6 text-white group-hover:text-blue-300 transition-colors duration-300" /> : <ChevronLeft className="w-6 h-6 text-white group-hover:text-green-300 transition-colors duration-300" />}
            </button>
          </div>
        </div>

        {/* User Profile Card */}
        <Link
          href={`/profile/${user?.username}`}
          className={cn(
            'group flex items-center p-4 rounded-2xl transition-all duration-500 cursor-pointer hover:shadow-xl hover:scale-[1.03] mb-8 relative overflow-hidden',
            theme === 'vibrant' ? 'bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border border-white/20' : 'bg-white/3 border border-white/6',
            collapsed ? 'justify-center' : 'space-x-4'
          )}
        >
          <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500', theme === 'vibrant' ? 'bg-gradient-to-r from-blue-500/10 via-green-500/10 to-teal-500/10' : 'bg-gradient-to-r from-gray-700/10 to-gray-600/10')}></div>
          {user?.avatar ? (
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover ring-3 ring-white/30 group-hover:ring-white/50 transition-all duration-500 relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-xl ring-3 ring-white/30 group-hover:ring-white/50 transition-all duration-500 relative z-10">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0 relative z-10">
              <p className="font-bold text-white truncate group-hover:text-blue-200 transition-colors duration-300 text-lg">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-white/70 truncate group-hover:text-green-200 transition-colors duration-300">@{user?.username}</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-center px-5 py-4 rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden',
                  collapsed ? 'justify-center' : 'space-x-4',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/30 via-green-500/30 to-teal-500/30 text-white shadow-xl ring-2 ring-white/30 backdrop-blur-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
                <Icon className={cn(
                  'w-7 h-7 transition-all duration-500 relative z-10',
                  isActive ? 'text-white scale-110' : theme === 'vibrant' ? 'group-hover:text-blue-300 group-hover:scale-110' : 'text-gray-200 group-hover:text-white/90 group-hover:scale-110'
                )} />
                {!collapsed && (
                  <span className="font-semibold relative z-10 transition-all duration-300 group-hover:translate-x-2 text-base">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-green-400 to-teal-400 rounded-r-2xl shadow-lg"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <nav className={cn('space-y-3 pt-6 border-t border-white/20', collapsed ? 'text-center' : '')}>
          {bottomMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-center px-5 py-4 rounded-2xl transition-all duration-500 cursor-pointer relative overflow-hidden',
                  collapsed ? 'justify-center' : 'space-x-4',
                  isActive
                    ? (theme === 'vibrant' ? 'bg-gradient-to-r from-blue-500/30 via-green-500/30 to-teal-500/30 text-white shadow-xl ring-2 ring-white/30 backdrop-blur-md' : 'bg-white/6 text-white shadow-sm ring-0')
                    : (theme === 'vibrant' ? 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-lg hover:scale-[1.02] backdrop-blur-sm' : 'text-gray-200 hover:bg-white/6 hover:text-white')
                )}
                style={{ animationDelay: `${(menuItems.length + index) * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
                <Icon className={cn(
                  'w-7 h-7 transition-all duration-500 relative z-10',
                  isActive ? 'text-white scale-110' : theme === 'vibrant' ? 'group-hover:text-teal-300 group-hover:scale-110' : 'text-gray-200 group-hover:text-white/90 group-hover:scale-110'
                )} />
                {!collapsed && (
                  <span className="font-semibold relative z-10 transition-all duration-300 group-hover:translate-x-2 text-base">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-green-400 to-teal-400 rounded-r-2xl shadow-lg"></div>
                )}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}