'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Splashscreen } from '@/components/Splashscreen';

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      // Simulate auth check - replace with actual auth logic
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      
      // Show splash screen for 1 second
      setTimeout(() => {
        setShowSplash(false);
        if (token) {
          router.push('/feed');
        } else {
          router.push('/auth/login');
        }
      }, 1000);
    };

    checkAuth();
  }, [router]);

  if (showSplash) {
    return <Splashscreen />;
  }

  return null;
}