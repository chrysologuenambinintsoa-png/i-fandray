import React from 'react';
import type { Metadata } from 'next';
import '../styles/globals.css';
import { Providers } from '@/components/Providers';
import { headers } from 'next/headers';
import { availableLocales } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'i-fandray - Modern Social Network',
  description: 'Connect with friends, share moments, and discover what matters most to you',
  keywords: 'social network, facebook alternative, connect, share, community',
  icons: {
    icon: '/logo.svg',
  },
};

function detectLocaleFromHeaders(): string | undefined {
  try {
    const accept = headers().get('accept-language') ?? '';
    if (!accept) return undefined;
    const parts = accept.split(',').map(p => p.split(';')[0].trim());
    for (const p of parts) {
      const lang = p.split('-')[0];
      if (availableLocales.includes(lang as any)) return lang;
    }
  } catch (e) {
    // ignore
  }
  return undefined;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const detected = detectLocaleFromHeaders();

  return (
    <html lang={detected ?? 'en'}>
      <body>
        <Providers initialLocale={(detected as any) ?? undefined}>
          {children}
        </Providers>
      </body>
    </html>
  );
}