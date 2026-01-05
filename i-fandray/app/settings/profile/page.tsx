'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/settings');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  );
}