'use client';

import React, { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Smile, MapPin, Tag, X, AlertCircle, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/upload';
import { Post } from '@/types';

const MapSelector = dynamic(() => import('./MapSelector'), { ssr: false });

interface CreatePostProps {
  onPost?: (post: Post) => void;
  groupId?: string;
}

export function CreatePost({ onPost, groupId }: CreatePostProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [mapPosition, setMapPosition] = useState<[number, number]>([48.8566, 2.3522]); // Paris default
  const [showMap, setShowMap] = useState(false);
  const [postToFeed, setPostToFeed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!content.trim() && mediaUrls.length === 0) return;

    setIsLoading(true);
    try {
      const endpoint = groupId ? `/api/groups/${groupId}/posts` : '/api/posts';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          mediaUrls,
          mediaType: mediaUrls.length > 1 ? 'mixed' : mediaTypes[0] || 'text',
          feeling: feeling.trim() || undefined,
          location: location.trim() || undefined,
          tags: tags.length > 0 ? tags : undefined,
          postToFeed: groupId ? postToFeed : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to create post: ${response.statusText}`);
      }

      const newPost = await response.json();

      // Reset form
      setContent('');
      setMediaUrls([]);
      setMediaTypes([]);
      setFeeling('');
      setLocation('');
      setTags([]);
      setIsExpanded(false);

      // Notify parent component
      onPost?.(newPost);

      toast.success('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[] | FileList) => {
    const uploadedUrls: string[] = [];
    const uploadedTypes: string[] = [];
    let hasErrors = false;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      try {
        const result = await uploadToCloudinary(file, { folder: 'posts' });
        // Cloudinary returns `secure_url` for the uploaded asset
        const url = result.secure_url || result.url || result.secureUrl;
        if (!url) throw new Error('Upload returned no URL');

        uploadedUrls.push(url);
        uploadedTypes.push(file.type);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error('Error uploading file:', error);
        const errorMessage = error instanceof Error ? error.message : `Failed to upload ${file.name}`;
        toast.error(errorMessage);
        hasErrors = true;
      }
    }

    if (uploadedUrls.length > 0) {
      setMediaUrls(prev => [...prev, ...uploadedUrls]);
      setMediaTypes(prev => [...prev, ...uploadedTypes]);
    }

    if (hasErrors && uploadedUrls.length === 0) {
      setUploadError('All files failed to upload. Please try again.');
    } else {
      setUploadError('');
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    setMediaTypes(mediaTypes.filter((_, i) => i !== index));
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM)';
    }

    return null;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setUploadError('');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const validFiles: File[] = [];
      let hasErrors = false;

      Array.from(files).forEach(file => {
        const error = validateFile(file);
        if (error) {
          setUploadError(error);
          hasErrors = true;
        } else {
          validFiles.push(file);
        }
      });

      if (!hasErrors && validFiles.length > 0) {
        handleFileUpload(validFiles);
      }
    }
  }, [mediaUrls, mediaTypes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      let hasErrors = false;

      Array.from(files).forEach(file => {
        const error = validateFile(file);
        if (error) {
          setUploadError(error);
          hasErrors = true;
        } else {
          validFiles.push(file);
        }
      });

      if (!hasErrors && validFiles.length > 0) {
        handleFileUpload(validFiles);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div
            onClick={() => setIsExpanded(true)}
            className={`flex-1 bg-gray-100 rounded-full px-4 py-3 cursor-pointer transition-colors ${
              isExpanded ? 'hidden' : 'hover:bg-gray-200'
            }`}
          >
            <p className="text-gray-500">What&apos;s on your mind?</p>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Text Input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('post.whatsOnMind')}
              className="w-full min-h-[120px] p-4 bg-transparent border-none focus:outline-none resize-none text-gray-900"
              rows={4}
            />

            {/* Media Preview */}
            {mediaUrls.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      {mediaTypes[index]?.startsWith('video/') ? (
                        <video
                          src={url}
                          className="w-full h-32 object-cover rounded-lg"
                          controls
                        />
                      ) : (
                        <img
                          src={url}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                        aria-label={`Remove media ${index + 1}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        {mediaTypes[index]?.startsWith('video/') ? 'Video' : 'Image'}
                      </div>
                    </div>
                  ))}
                </div>
                {mediaUrls.length >= 6 && (
                  <p className="text-sm text-amber-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Maximum 6 files allowed
                  </p>
                )}
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                aria-label="Upload images or videos"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600">
                {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images (JPEG, PNG, GIF, WebP) and Videos (MP4, WebM) up to 10MB each
              </p>
              {uploadError && (
                <p className="text-sm text-red-600 flex items-center mt-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {uploadError}
                </p>
              )}
            </div>

            {/* Additional Fields */}
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-2">
                <Smile className="w-5 h-5 text-yellow-500" />
                <label htmlFor="feeling-select" className="sr-only">Feeling</label>
                <select
                  id="feeling-select"
                  value={feeling}
                  onChange={(e) => setFeeling(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select feeling</option>
                  <option value="happy">Happy</option>
                  <option value="sad">Sad</option>
                  <option value="excited">Excited</option>
                  <option value="angry">Angry</option>
                  <option value="loved">Loved</option>
                  <option value="tired">Tired</option>
                  <option value="blessed">Blessed</option>
                  <option value="grateful">Grateful</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you?"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Map
                </button>
              </div>
              {showMap && (
                <MapSelector
                  position={mapPosition}
                  onPositionChange={(pos) => {
                    setMapPosition(pos);
                    setLocation(`${pos[0]}, ${pos[1]}`);
                  }}
                  onClose={() => setShowMap(false)}
                />
              )}
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-blue-500" />
                <input
                  type="text"
                  value={tags.join(', ')}
                  onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="Tag people (comma separated)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              {groupId && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="postToFeed"
                    checked={postToFeed}
                    onChange={(e) => setPostToFeed(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="postToFeed" className="text-sm text-gray-700">
                    Also post to feed
                  </label>
                </div>
              )}
            </div>

            {/* Add to Post */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('post.addFeeling')}>
                  <Smile className="w-6 h-6 text-yellow-500" />
                  <span className="text-sm text-gray-700 font-medium">{t('post.feeling')}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('post.location')}>
                  <MapPin className="w-6 h-6 text-red-500" />
                  <span className="text-sm text-gray-700 font-medium">{t('post.location')}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label={t('post.tag')}>
                  <Tag className="w-6 h-6 text-blue-500" />
                  <span className="text-sm text-gray-700 font-medium">{t('post.tag')}</span>
                </button>
              </div>

              <button
                onClick={handlePost}
                disabled={(!content.trim() && mediaUrls.length === 0) || isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('post.posting') : t('post.post')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}