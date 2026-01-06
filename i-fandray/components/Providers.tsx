'use client';

import React, { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { useSettings } from '@/hooks/useSettings';
import { TranslationProvider } from './TranslationProvider';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useSettings();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale?: import('@/lib/i18n').Locale }) {
  return (
    <SessionProvider>
      <TranslationProvider initialLocale={initialLocale}>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
              },
            }}
          />
        </ThemeProvider>
      </TranslationProvider>
    </SessionProvider>
  );
}