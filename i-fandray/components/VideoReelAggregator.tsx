'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, Heart, MessageCircle, Share2, TrendingUp, Clock, Eye, Plus, Camera, Film, Sparkles, Upload } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/components/TranslationProvider';

interface VideoReel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  category: string;
  isLive?: boolean;
  isTrending?: boolean;
  createdAt: Date;
  author?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export function VideoReelAggregator() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videos, setVideos] = useState<VideoReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Tout', icon: Video, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'live', name: 'En direct', icon: Eye, color: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { id: 'trending', name: 'Tendances', icon: TrendingUp, color: 'bg-gradient-to-r from-yellow-500 to-red-500' },
    { id: 'recent', name: 'Récent', icon: Clock, color: 'bg-gradient-to-r from-blue-500 to-purple-500' },
    { id: 'following', name: 'Abonnements', icon: Heart, color: 'bg-gradient-to-r from-pink-500 to-red-500' },
  ];

  const fetchVideos = useCallback(async (category: string, resetOffset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = resetOffset ? 0 : offset;
      const url = `/api/videos?category=${category}&limit=20&offset=${currentOffset}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();

      const mappedVideos: VideoReel[] = data.videos.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description || item.title,
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnailUrl,
        duration: item.duration || 0,
        views: item.views || 0,
        likes: item.likes || 0,
        comments: item.comments || 0,
        category: item.category,
        isLive: item.isLive || false,
        isTrending: item.isTrending || false,
        createdAt: new Date(item.createdAt),
        author: item.author,
      }));

      if (resetOffset) {
        setVideos(mappedVideos);
        setOffset(20);
      } else {
        setVideos(prev => [...prev, ...mappedVideos]);
        setOffset(prev => prev + 20);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchVideos(selectedCategory, true);
  }, [selectedCategory, fetchVideos]);

  const handleLike = async (videoId: string) => {
    try {
      // Check if user already liked this video (optimistic update)
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      const isLiked = video.likes > 0; // This is a simplification - in a real app you'd track per user

      const response = await fetch(`/api/videos/${videoId}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state optimistically
        setVideos(videos.map(v =>
          v.id === videoId
            ? { ...v, likes: isLiked ? v.likes - 1 : v.likes + 1 }
            : v
        ));
      } else {
        console.error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = async (videoId: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) return;

      const shareUrl = `${window.location.origin}/videos/${videoId}`;

      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        // You could show a toast notification here
        alert('Lien copié dans le presse-papiers !');
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchVideos(selectedCategory, false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Create video preview URL
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const handleFileRemove = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setSelectedFile(null);
    setVideoPreview(null);
  };

  const handleCreateReel = async (reelData: { title: string; description: string; category: string }) => {
    if (!selectedFile) return;

    try {
      setIsCreating(true);
      setCreateError(null);

      // First, upload the video file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', 'video');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();

      // Then create the video record
      const videoResponse = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: reelData.title,
          description: reelData.description,
          videoUrl: uploadData.url,
          thumbnailUrl: uploadData.thumbnailUrl || uploadData.url, // Use video URL as fallback
          duration: 0, // TODO: Extract duration from video file
          category: reelData.category,
        }),
      });

      if (!videoResponse.ok) {
        throw new Error('Failed to create video');
      }

      const newVideo = await videoResponse.json();

      // Add to local state
      setVideos(prev => [newVideo, ...prev]);

      // Reset form
      setSelectedFile(null);
      setVideoPreview(null);
      setShowCreateModal(false);

    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create reel');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  VIDÉO
                </h1>
                <p className="text-sm text-gray-600">Découvrez et partagez des vidéos incroyables</p>
              </div>
            </div>

            {/* Create Reel Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Créer un Reel</span>
            </motion.button>
          </div>

          {/* Category Pills */}
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                    isSelected
                      ? `${category.color} text-white shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                  {isSelected && <Sparkles className="w-4 h-4" />}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center py-16"
          >
            <div className="text-center bg-white rounded-3xl p-8 shadow-xl max-w-md">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchVideos(selectedCategory, true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Réessayer
              </motion.button>
            </div>
          </motion.div>
        ) : loading && videos.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="aspect-video bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-300 rounded-full"></div>
                  <div className="h-3 bg-gray-300 rounded-full w-3/4"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 bg-gray-300 rounded-full w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded-full w-1/4"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl p-12 shadow-xl max-w-lg mx-auto">
              <div className="text-6xl mb-6">🎬</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune vidéo trouvée</h3>
              <p className="text-gray-600 mb-8">Soyez le premier à partager une vidéo incroyable !</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Créer la première vidéo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchVideos('all', true)}
                  className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
                >
                  Explorer tout
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Video Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              <AnimatePresence>
                {videos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 30
                    }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop&crop=center';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                          <Film className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-white bg-opacity-90 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <Play className="w-8 h-8 text-purple-600" />
                        </motion.div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col space-y-2">
                        {video.isLive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                          >
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>LIVE</span>
                          </motion.div>
                        )}
                        {video.isTrending && !video.isLive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-to-r from-yellow-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>TENDANCE</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Author */}
                      <div className="flex items-center space-x-3 mb-4">
                        {video.author && (
                          <>
                            <img
                              src={video.author.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'}
                              alt={video.author.username}
                              className="w-10 h-10 rounded-full border-2 border-purple-100"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{video.author.username}</p>
                              <p className="text-xs text-gray-500">{formatDate(video.createdAt)}</p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer">
                        {video.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {video.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">{video.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span className="font-medium">{video.likes.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          {video.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Regarder</span>
                        </motion.button>

                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLike(video.id)}
                            className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
                          >
                            <Heart className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShare(video.id)}
                            className="p-2 hover:bg-blue-50 rounded-xl transition-colors group"
                          >
                            <Share2 className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More */}
            {hasMore && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadMore}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Charger plus de vidéos
                </motion.button>
              </motion.div>
            )}

            {/* Loading More Indicator */}
            {loading && videos.length > 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex space-x-3">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: i * 0.2
                      }}
                      className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Reel Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <CreateReelForm
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateReel}
                isCreating={isCreating}
                error={createError}
                selectedFile={selectedFile}
                videoPreview={videoPreview}
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Create Reel Form Component
function CreateReelForm({
  onClose,
  onSubmit,
  isCreating,
  error,
  selectedFile,
  videoPreview,
  onFileSelect,
  onFileRemove
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; category: string }) => void;
  isCreating: boolean;
  error: string | null;
  selectedFile: File | null;
  videoPreview: string | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general'
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'general', name: 'Général' },
    { id: 'music', name: 'Musique' },
    { id: 'dance', name: 'Danse' },
    { id: 'comedy', name: 'Humour' },
    { id: 'education', name: 'Éducation' },
    { id: 'sports', name: 'Sports' },
    { id: 'food', name: 'Cuisine' },
    { id: 'travel', name: 'Voyage' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title.trim()) return;

    onSubmit(formData);
  };

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Créer un Reel</h3>
        <p className="text-gray-600">Partagez votre créativité avec la communauté</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload Section */}
        {!selectedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Glissez-déposez votre vidéo ici
                </p>
                <p className="text-gray-600 mb-4">
                  ou cliquez pour parcourir vos fichiers
                </p>
                <p className="text-sm text-gray-500">
                  Formats supportés: MP4, MOV, AVI (max 100MB)
                </p>
              </div>
              <input
                id="reelFile"
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileInput}
                aria-label="Choisir un fichier vidéo"
                title="Choisir un fichier vidéo"
                className="hidden"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Choisir un fichier
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-black">
              <video
                src={videoPreview!}
                className="w-full h-48 object-cover"
                controls
                preload="metadata"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onFileRemove();
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </motion.button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="reelTitle" className="block text-sm font-semibold text-gray-900 mb-2">
              Titre *
            </label>
            <input
              id="reelTitle"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Donnez un titre accrocheur à votre reel"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="reelDescription" className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="reelDescription"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez votre reel..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <div>
            <label htmlFor="reelCategory" className="block text-sm font-semibold text-gray-900 mb-2">
              Catégorie
            </label>
            <select
              id="reelCategory"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              aria-label="Sélectionner une catégorie"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
          >
            Annuler
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isCreating || !selectedFile || !formData.title.trim()}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Création...</span>
              </div>
            ) : (
              'Publier le Reel'
            )}
          </motion.button>
        </div>
      </form>
    </>
  );
}