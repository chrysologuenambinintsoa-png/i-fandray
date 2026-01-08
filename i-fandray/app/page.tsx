'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Splashscreen } from '@/components/Splashscreen';

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load

    // Show splash screen for 1 second
    const timer = setTimeout(() => {
      setShowSplash(false);
      if (session?.user) {
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
        router.push('/auth/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, session, status]);

  if (showSplash || status === 'loading') {
    return <Splashscreen />;
  }

  return null;
}