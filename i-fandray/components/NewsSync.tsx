'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';

interface NewsSyncProps {
  onSyncComplete?: () => void;
}

export function NewsSync({ onSyncComplete }: NewsSyncProps) {
  const { t } = useTranslation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSync = async (category?: string) => {
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch('/api/news/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncResult({
          success: true,
          message: `Synchronization started for ${category || 'all'} categories`,
        });

        // Call onSyncComplete after a delay to allow sync to complete
        setTimeout(() => {
          onSyncComplete?.();
        }, 3000);
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Sync failed',
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Network error occurred',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">News Synchronization</h3>
          <p className="text-sm text-gray-600">Sync latest news from external sources</p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleSync()}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All</span>
          </button>

          <button
            onClick={() => handleSync('technology')}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Tech</span>
          </button>
        </div>
      </div>

      {syncResult && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          syncResult.success
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {syncResult.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="text-sm">{syncResult.message}</span>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>• News are automatically cleaned up after 30 days</p>
        <p>• Duplicate articles are automatically skipped</p>
        <p>• Sync process runs in the background</p>
      </div>
    </div>
  );
}