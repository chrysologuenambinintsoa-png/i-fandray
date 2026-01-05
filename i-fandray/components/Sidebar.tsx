'use client';

import { Home, Users, Newspaper, Video, Settings, MessageSquare, User, HelpCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

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
      icon: Newspaper,
      label: t('navigation.actualite'),
      href: '/actualite',
      id: 'actualite',
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
      'fixed left-0 top-16 bottom-0 bg-card backdrop-blur-sm border-r border-border overflow-y-auto hidden lg:block transition-width duration-200',
      collapsed ? 'w-20' : 'w-64'
    )}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            {!collapsed && <span className="font-bold text-card-foreground">i-fandray</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-gray-800" /> : <ChevronLeft className="w-4 h-4 text-gray-800" />}
          </button>
        </div>
        {/* User Profile Card */}
        <Link
          href={`/profile/${user?.username}`}
          className={cn(
            'flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer',
            collapsed ? 'justify-center' : 'space-x-3'
          )}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
              </div>
            )}
        </Link>

        {/* Navigation Menu */}
        <nav className="mt-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                  className={cn(
                    'flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer gap-3',
                    collapsed ? 'justify-center' : 'space-x-3 px-4',
                    isActive
                      ? 'bg-white/10 text-green-700 ring-1 ring-green-200'
                      : 'text-gray-700 hover:bg-white/5'
                  )}
              >
                <Icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

          {/* Bottom Menu */}
          <nav className={cn('absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 space-y-1', collapsed ? 'text-center' : '')}>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                    'flex items-center px-3 py-3 rounded-lg transition-colors cursor-pointer',
                    collapsed ? 'justify-center' : 'space-x-3 px-4',
                    isActive
                      ? 'bg-white/10 text-green-700'
                      : 'text-gray-700 hover:bg-white/5'
                )}
              >
                <Icon className="w-5 h-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}