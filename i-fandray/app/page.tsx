'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamically import Splashscreen to avoid scroll issues
const Splashscreen = dynamic(() => import('@/components/Splashscreen').then(mod => ({ default: mod.Splashscreen })), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSplash, setShowSplash] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only run this effect once and when status is not 'loading'
    if (status === 'loading' || hasRedirected) return;

    // Show splash screen for 1 second before redirecting
    const timer = setTimeout(() => {
      setShowSplash(false);
      setHasRedirected(true);

      if (session?.user?.email) {
        // User is authenticated
        try {
          const seen = localStorage.getItem('seenWelcome');
          if (!seen || seen !== 'true') {
            router.push('/welcome');
            return;
          }
        } catch (e) {
          // ignore localStorage errors
        }
        router.push('/feed');
      } else {
        // User is not authenticated
        router.push('/auth/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, session?.user?.email, status, hasRedirected]);

  if (showSplash || status === 'loading') {
    return <Splashscreen />;
  }

  return null;
}