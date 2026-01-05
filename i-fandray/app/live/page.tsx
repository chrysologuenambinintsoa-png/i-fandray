"use client";

import React, { useState } from 'react';
import { Video } from 'lucide-react';
import { VideoCall } from '@/components/VideoCall';
import { VoiceMessage } from '@/components/VoiceMessage';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

export default function LivePage() {
  const [inCall, setInCall] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomToken, setRoomToken] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [voiceMessages, setVoiceMessages] = useState<Array<{ id: string; url: string; duration: number; sender?: string }>>([]);

  // Initialize theme from localStorage or system preference
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved as 'light' | 'dark');
        if (saved === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        return;
      }

      // fallback to system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      if (initial === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (e) {
      // Ignore (SSR safety)
    }
  }, []);

  // Handle URL parameters for joining rooms
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    const tokenParam = urlParams.get('token');

    if (roomParam) {
      setRoomId(roomParam);
      if (tokenParam) {
        setRoomToken(tokenParam);
      }
      setInCall(true);
    }
  }, []);

  const [participants] = useState<Array<{ id: string; name: string }>>([]);

  const generateRoomToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSendVoice = (audioBlob: Blob, duration: number) => {
    const url = URL.createObjectURL(audioBlob);
    setVoiceMessages((prev) => [{ id: Date.now().toString(), url, duration, sender: 'You' }, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="live" />

        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Video className="w-10 h-10 text-gray-600 dark:text-gray-400" />
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Live</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start or join live video and voice sessions.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const id = `room-${Date.now().toString(36)}`;
                    const token = generateRoomToken();
                    setRoomId(id);
                    setRoomToken(token);
                    setInCall(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Start Live
                </button>

                <button
                  onClick={() => {
                    const next = theme === 'light' ? 'dark' : 'light';
                    setTheme(next);
                    if (next === 'dark') document.documentElement.classList.add('dark');
                    else document.documentElement.classList.remove('dark');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg"
                >
                  {theme === 'light' ? 'Dark' : 'Light'} mode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Live preview</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click &quot;Start Live&quot; to open the live call UI. This demo uses your device camera/mic.</p>
                  {roomId && (
                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                      Room: <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{roomId}</span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(window.location.origin + '/live?room=' + roomId + (roomToken ? '&token=' + roomToken : ''))}
                        className="ml-3 text-sm text-green-600 dark:text-green-400 hover:underline"
                      >Copy link</button>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Voice Messages</h3>

                  <div className="space-y-3">
                    <VoiceMessage onSend={handleSendVoice} />

                    {voiceMessages.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {voiceMessages.map((m) => (
                          <div key={m.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">{m.sender?.charAt(0) ?? 'Y'}</div>
                              <audio controls src={m.url} className="h-8" />
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{m.duration}s</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-md font-medium mb-2 text-gray-900 dark:text-white">Participants</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {participants.length > 0 ? 'Participants will appear here during live sessions.' : 'No participants yet. Start a live session to see participants.'}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>

      {inCall && (
        <VideoCall
          isVideo
          isGroup
          participants={participants}
          roomId={roomId || undefined}
          roomToken={roomToken || undefined}
          onEndCall={() => setInCall(false)}
          onSendMessage={() => console.log('Open chat')}
        />
      )}
    </div>
  );
}