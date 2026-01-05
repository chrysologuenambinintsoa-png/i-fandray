'use client';

import dynamic from 'next/dynamic';

const SettingsPageClient = dynamic(() => import('./SettingsPageClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-100">
      <div className="flex pt-16">
        <main className="flex-1 lg:ml-64">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  ),
});

export default function SettingsPage() {
  return <SettingsPageClient />;
}