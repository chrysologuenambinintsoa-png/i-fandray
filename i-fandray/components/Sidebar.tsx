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
      'fixed left-0 top-16 bottom-0 glass overflow-y-auto hidden lg:block transition-all duration-300 ease-in-out shadow-2xl',
      collapsed ? 'w-20' : 'w-64'
    )}>
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {!collapsed && (
              <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                i-fandray
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-xl btn-personal hover:scale-110 transition-all duration-200 shadow-lg"
            aria-label="Toggle sidebar"
            title="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* User Profile Card */}
        <Link
          href={`/profile/${user?.username}`}
          className={cn(
            'group flex items-center p-3 rounded-xl card transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] mb-6',
            collapsed ? 'justify-center' : 'space-x-4'
          )}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-semibold text-lg ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
              {user?.firstName?.[0] || 'U'}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors duration-200">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
            </div>
          )}
        </Link>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden',
                  collapsed ? 'justify-center' : 'space-x-4',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-card-foreground shadow-lg ring-1 ring-primary/30'
                    : 'text-card-foreground/80 hover:bg-white/10 hover:text-card-foreground hover:shadow-md hover:scale-[1.02]'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className={cn(
                  'w-6 h-6 transition-all duration-300 relative z-10',
                  isActive ? 'text-primary' : 'group-hover:text-primary group-hover:scale-110'
                )} />
                {!collapsed && (
                  <span className="font-medium relative z-10 transition-all duration-200 group-hover:translate-x-1">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <nav className={cn('space-y-2 pt-4 border-t border-border/50', collapsed ? 'text-center' : '')}>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'group flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer relative overflow-hidden',
                  collapsed ? 'justify-center' : 'space-x-4',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-card-foreground shadow-lg ring-1 ring-primary/30'
                    : 'text-card-foreground/80 hover:bg-white/10 hover:text-card-foreground hover:shadow-md hover:scale-[1.02]'
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Icon className={cn(
                  'w-6 h-6 transition-all duration-300 relative z-10',
                  isActive ? 'text-primary' : 'group-hover:text-primary group-hover:scale-110'
                )} />
                {!collapsed && (
                  <span className="font-medium relative z-10 transition-all duration-200 group-hover:translate-x-1">
                    {item.label}
                  </span>
                )}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}