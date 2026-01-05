'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  MonitorOff,
  MessageCircle,
  Users,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/components/TranslationProvider';

const VideoElement = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

interface VideoCallProps {
  isVideo?: boolean;
  isGroup?: boolean;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
    stream?: MediaStream;
  }>;
  onEndCall?: () => void;
  onToggleMute?: () => void;
  onToggleVideo?: () => void;
  onToggleScreen?: () => void;
  onSendMessage?: () => void;
  roomId?: string;
  roomToken?: string;
}

export function VideoCall({
  isVideo = true,
  isGroup = false,
  participants = [],
  onEndCall,
  onToggleMute,
  onToggleVideo,
  onToggleScreen,
  onSendMessage,
  roomId,
  roomToken,
}: VideoCallProps) {
  const { t } = useTranslation();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideo);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown');
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const clientIdRef = useRef<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
          const micPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });

          if (cameraPermission.state === 'denied' || micPermission.state === 'denied') {
            setPermissionStatus('denied');
            setAuthError(t('video.permissionDenied'));
          } else if (cameraPermission.state === 'granted' && micPermission.state === 'granted') {
            setPermissionStatus('granted');
          } else {
            setPermissionStatus('prompt');
          }
        }
      } catch (error: any) {
        // Permissions API not supported, fallback to trying getUserMedia
        setPermissionStatus('unknown');
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const startStream = async () => {
      if (permissionStatus === 'denied') {
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideoEnabled,
          audio: true,
        });
        setLocalStream(stream);
        setPermissionStatus('granted');
        setAuthError(null);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error: unknown) {
        console.error('Error accessing media devices:', error);
        // Handle permission denied or device not available
        if (error instanceof DOMException) {
          if (error.name === 'NotAllowedError') {
            setPermissionStatus('denied');
            setAuthError(t('video.permissionDenied'));
          } else if (error.name === 'NotFoundError') {
            setAuthError(t('video.deviceNotFound'));
          } else if (error.name === 'NotReadableError') {
            setAuthError(t('video.deviceInUse'));
          } else {
            setAuthError(t('video.mediaAccessError') + (error instanceof Error ? error.message : String(error)));
          }
        }
        setIsVideoEnabled(false);
      }
    };

    if (isVideoEnabled && permissionStatus !== 'denied') {
      startStream();
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      // close peer connections
      Object.values(peersRef.current).forEach((pc) => pc.close());
      peersRef.current = {};
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isVideoEnabled, isVideo, permissionStatus]);

  useEffect(() => {
    // Simple WebSocket signaling client (expects a signaling server that forwards messages by room)
    if (!roomId) return;
    const signalingUrl = process.env.NEXT_PUBLIC_SIGNALING_URL || 'ws://localhost:3002';
    try {
      const ws = new WebSocket(signalingUrl);
      wsRef.current = ws;
      const clientId = (Math.random().toString(36).substring(2, 9));
      clientIdRef.current = clientId;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join', roomId, clientId, roomToken }));
      };

      ws.onmessage = async (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const { type, from, to, payload } = data;
          if (to && to !== clientIdRef.current) return; // not for me

          if (type === 'auth-error') {
            setAuthError(payload?.message || 'Authentication failed');
            ws.close();
            return;
          }

          if (type === 'participants') {
            // existing participants: create offer to each
            const others: string[] = payload || [];
            for (const otherId of others) {
              if (otherId === clientIdRef.current) continue;
              await createPeerConnectionAndOffer(otherId);
            }
          }

          if (type === 'offer' && payload) {
            // incoming offer
            const { sdp } = payload;
            const pc = await createPeerConnection(from);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            ws.send(JSON.stringify({ type: 'answer', roomId, from: clientIdRef.current, to: from, payload: { sdp: pc.localDescription } }));
          }

          if (type === 'answer' && payload) {
            const { sdp } = payload;
            const pc = peersRef.current[from];
            if (pc) {
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
          }

          if (type === 'candidate' && payload) {
            const pc = peersRef.current[from];
            if (pc) {
              try {
                await pc.addIceCandidate(payload.candidate);
              } catch (e) {
                console.warn('Failed to add ICE candidate', e);
              }
            }
          }
        } catch (e) {
          console.error('Invalid signaling message', e);
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch (e) {
      console.warn('Signaling connection failed', e);
    }

    async function createPeerConnectionAndOffer(peerId: string) {
      const pc = await createPeerConnection(peerId);
      if (!pc) return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current?.send(JSON.stringify({ type: 'offer', roomId, from: clientIdRef.current, to: peerId, payload: { sdp: pc.localDescription } }));
    }

    async function createPeerConnection(peerId: string) {
      if (peersRef.current[peerId]) return peersRef.current[peerId];
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peersRef.current[peerId] = pc;

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          wsRef.current?.send(JSON.stringify({ type: 'candidate', roomId, from: clientIdRef.current, to: peerId, payload: { candidate: event.candidate } }));
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
      };

      // add local tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
      }

      return pc;
    }

    return () => {
      // cleanup ws on unmount
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, localStream]);

  const requestPermissions = async () => {
    try {
      setAuthError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setPermissionStatus('granted');
      setIsVideoEnabled(true);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      console.error('Error requesting permissions:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPermissionStatus('denied');
        setAuthError(t('video.permissionStillDenied'));
      } else {
        setAuthError(t('video.permissionRequestError') + (error?.message || String(error)));
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onToggleMute?.();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  };

  const handleToggleVideo = () => {
    const newVideoEnabled = !isVideoEnabled;
    setIsVideoEnabled(newVideoEnabled);
    onToggleVideo?.();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = newVideoEnabled;
      });
    }
  };

  const handleToggleScreen = async () => {
    try {
      if (!isScreenSharing) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setIsScreenSharing(true);
        onToggleScreen?.();
      } else {
        setIsScreenSharing(false);
        onToggleScreen?.();
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'fixed inset-0 bg-gray-900 z-50 flex flex-col',
        isFullscreen && 'fullscreen'
      )}
    >
      {authError && (
        <div className="bg-red-600 text-white p-4 text-center">
          <p className="font-semibold">Erreur</p>
          <p>{authError}</p>
          <button
            onClick={() => setAuthError(null)}
            className="mt-2 px-4 py-2 bg-red-700 hover:bg-red-800 rounded"
          >
            Ignorer
          </button>
        </div>
      )}

      {permissionStatus === 'prompt' && !localStream && (
        <div className="bg-blue-600 text-white p-4 mx-4 rounded-lg">
          <h3 className="font-semibold">Autorisation requise</h3>
          <p className="text-sm mb-3">
            Pour participer à cet appel vidéo, vous devez autoriser l&apos;accès à votre caméra et microphone.
            Une fenêtre de votre navigateur va apparaître pour vous demander l&apos;autorisation.
          </p>
          <button
            onClick={requestPermissions}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded text-sm font-medium"
          >
            {t('video.allowAccess')}
          </button>
        </div>
      )}
      <div className="bg-black bg-opacity-50 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-white">
            <h2 className="text-lg font-semibold">
              {isGroup ? t('video.groupCall') : t('video.videoCall')}
            </h2>
            <p className="text-sm text-gray-300">
              {formatDuration(callDuration)} • {participants.length + 1} {t('video.participants')}
            </p>
          </div>
        </div>
        <button
          onClick={handleFullscreen}
          className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {authError && (
        <div className="bg-red-600 text-white p-4 mx-4 rounded-lg">
          <h3 className="font-semibold">{t('video.authorizationError')}</h3>
          <p className="text-sm mb-3">{authError}</p>
          <div className="flex space-x-2">
            {permissionStatus === 'denied' && (
              <button
                onClick={requestPermissions}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                {t('video.retry')}
              </button>
            )}
            <button
              onClick={onEndCall}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-sm"
            >
              {t('video.closeCall')}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 overflow-hidden">
        <div
          className={cn(
            'grid gap-4 h-full',
            isGroup
              ? 'grid-cols-2 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2'
          )}
        >
          <div className="relative bg-gray-800 rounded-xl overflow-hidden">
            {isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">You</span>
                </div>
              </div>
            )}
            
            {isMuted && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <MicOff className="w-4 h-4 inline mr-1" />
                Muted
              </div>
            )}

            {isScreenSharing && (
              <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                <Monitor className="w-4 h-4 inline mr-1" />
                Sharing
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              You (Host)
            </div>
          </div>

          {/* Remote streams from signaling */}
          {Object.entries(remoteStreams).map(([id, stream]) => (
            <div key={id} className="relative bg-gray-800 rounded-xl overflow-hidden">
              <VideoElement stream={stream} />

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {id}
              </div>

              <div className="absolute top-4 left-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}

          {/* Fallback participants (no stream) */}
          {participants.filter(p => !p.stream).map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden">
              {participant.avatar ? (
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {participant.name[0]}
                    </span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                {participant.name}
              </div>

              <div className="absolute top-4 left-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black bg-opacity-50 p-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={handleToggleMute}
            className={cn(
              'p-4 rounded-full transition-all transform hover:scale-110',
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={handleToggleVideo}
            className={cn(
              'p-4 rounded-full transition-all transform hover:scale-110',
              !isVideoEnabled ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
          >
            {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>

          <button
            onClick={handleToggleScreen}
            className={cn(
              'p-4 rounded-full transition-all transform hover:scale-110',
              isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
          >
            {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={cn(
              'p-4 rounded-full transition-all transform hover:scale-110',
              !isSpeakerOn ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            )}
            aria-label={isSpeakerOn ? "Mute speaker" : "Unmute speaker"}
          >
            {!isSpeakerOn ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>

          <button
            onClick={onSendMessage}
            className="p-4 bg-gray-700 text-white rounded-full transition-all transform hover:scale-110 hover:bg-gray-600"
            aria-label="Send message"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {isGroup && (
            <button className="p-4 bg-gray-700 text-white rounded-full transition-all transform hover:scale-110 hover:bg-gray-600" aria-label="Show participants">
              <Users className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={onEndCall}
            className="p-4 bg-red-500 text-white rounded-full transition-all transform hover:scale-110 hover:bg-red-600"
            aria-label="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}