'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Trash2, Play, Pause } from 'lucide-react';
import { useTranslation } from '@/components/TranslationProvider';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  onSend?: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
}

export function VoiceMessage({ onSend, maxDuration = 60 }: VoiceMessageProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setIsPlaying(false);
  };

  const handleSend = () => {
    if (audioBlob && onSend) {
      onSend(audioBlob, duration);
      deleteRecording();
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getWaveform = () => {
    const bars = 30;
    const svgHeight = 40;
    return (
      <svg width={bars * 1.5} height={svgHeight} className="waveform-svg">
        {Array.from({ length: bars }, (_, i) => {
          const height = Math.random() * 30 + 10;
          return (
            <rect
              key={i}
              x={i * 1.5}
              y={svgHeight - height}
              width="1"
              height={height}
              fill="#16a34a"
              rx="0.5"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      {audioBlob ? (
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlay}
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            aria-label={isPlaying ? t('voice.pauseRecording') : t('voice.playRecording')}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <audio ref={audioRef} src={audioUrl || ''} onEnded={() => setIsPlaying(false)} />

          <div className="flex-1">
            <div className="h-10 flex items-center justify-center" role="img" aria-label={t('voice.audioWaveform')}>
              {getWaveform()}
            </div>
          </div>

          <div className="text-sm font-medium text-gray-700 min-w-[50px]">
            {formatDuration(duration)}
          </div>

          <button
            onClick={deleteRecording}
            className="p-3 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            aria-label={t('voice.deleteRecording')}
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleSend}
            className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            aria-label="Send voice message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          {isRecording && (
            <div className="flex-1">
              <div className="h-10 flex items-center space-x-1 justify-center">
                {getWaveform()}
              </div>
            </div>
          )}

          <div className={cn(
            'text-sm font-medium min-w-[50px]',
            isRecording ? 'text-red-600' : 'text-gray-700'
          )}>
            {formatDuration(duration)}
          </div>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              'p-4 rounded-full transition-all transform hover:scale-110 flex items-center space-x-2',
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            {isRecording ? (
              <>
                <MicOff className="w-5 h-5" />
                <span className="font-medium">Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                <span className="font-medium">Record</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}