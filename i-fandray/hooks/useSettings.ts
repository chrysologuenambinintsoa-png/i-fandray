'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings } from '@/types';
import { Locale, availableLocales } from '@/lib/i18n';

interface SettingsStore extends AppSettings {
  setLanguage: (language: Locale) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setNotification: (key: keyof AppSettings['notifications'], value: boolean) => void;
  setPrivacy: (key: keyof AppSettings['privacy'], value: any) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    profileVisibility: 'public',
    messageRequests: true,
    showOnlineStatus: true,
  },
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setLanguage: (language) =>
        set({ language }),
      
      setTheme: (theme) =>
        set({ theme }),
      
      setNotification: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),
      
      setPrivacy: (key, value) =>
        set((state) => ({
          privacy: {
            ...state.privacy,
            [key]: value,
          },
        })),
      
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
    }
  )
);