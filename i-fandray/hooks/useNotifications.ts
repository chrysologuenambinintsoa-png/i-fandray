'use client';

import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  addNotification: (notification: Notification) => void;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),
  
  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        const notifications = data.notifications.map((notif: any) => ({
          ...notif,
          createdAt: new Date(notif.createdAt),
        }));
        set({
          notifications,
          unreadCount: data.unreadCount,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ loading: false });
    }
  },
  
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        isRead: true,
      })),
      unreadCount: 0,
    })),
  
  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n.id !== notificationId),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    }),
  
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));