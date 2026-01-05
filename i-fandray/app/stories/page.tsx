'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Story } from '@/types';
import { Plus, X, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view');
    if (viewId && stories.length > 0) {
      const story = stories.find(s => s.id === viewId);
      if (story) {
        setSelectedStory(story);
      }
    }
  }, [stories]);

  const fetchStories = async () => {
    try {
      const [storiesResponse, sponsoredResponse] = await Promise.all([
        fetch('/api/stories'),
        fetch('/api/sponsored?placement=story')
      ]);

      if (!storiesResponse.ok) {
        throw new Error('Failed to fetch stories');
      }

      const storiesData = await storiesResponse.json();
      const sponsoredData = sponsoredResponse.ok ? await sponsoredResponse.json() : [];

      // Add sponsored as special stories
      const sponsoredStories = sponsoredData.map((sponsored: any) => ({
        id: `sponsored-${sponsored.id}`,
        mediaUrl: sponsored.image || sponsored.externalUrl,
        mediaType: 'image',
        duration: 5000,
        viewers: 0,
        createdAt: sponsored.createdAt,
        expiresAt: sponsored.campaignEnd,
        author: {
          id: 'sponsored',
          username: 'sponsored',
          firstName: 'Sponsorisé',
          lastName: '',
          avatar: null,
        },
        isSponsored: true,
        sponsoredData: sponsored,
      }));

      setStories([...storiesData, ...sponsoredStories]);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error('Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      // Upload file first
      const formData = new FormData();
      formData.append('file', uploadFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      const uploadData = await uploadResponse.json();

      // Create story
      const storyResponse = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaUrl: uploadData.url,
          mediaType: uploadData.type,
          duration: 5000, // 5 seconds default
        }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to create story');
      }

      const newStory = await storyResponse.json();
      setStories(prev => [newStory, ...prev]);
      setShowCreateModal(false);
      setUploadFile(null);
      toast.success('Story created successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReaction = async (storyId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to react to story');
      }

      // Send notification to story author
      const story = stories.find(s => s.id === storyId);
      if (story?.author?.id && story.author.id !== user?.id) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'story_reaction',
            content: `${user?.firstName} ${user?.lastName} a réagi à votre story`,
            recipientId: story.author.id,
            data: JSON.stringify({ storyId, emoji }),
          }),
        });
      }

      // Update local state
      setStories(prev =>
        prev.map(story =>
          story.id === storyId
            ? {
                ...story,
                reactions: [
                  ...(story.reactions || []),
                  {
                    id: Date.now().toString(),
                    emoji,
                    createdAt: new Date(),
                    storyId,
                    userId: user!.id,
                    user: {
                      id: user!.id,
                      email: user!.email,
                      firstName: user!.firstName,
                      lastName: user!.lastName,
                      username: user!.username,
                      avatar: user!.avatar,
                      bio: user!.bio,
                      location: user!.location,
                      website: user!.website,
                      dateOfBirth: user!.dateOfBirth,
                      gender: user!.gender,
                      isVerified: user!.isVerified,
                      isActive: user!.isActive,
                      isOnline: user!.isOnline,
                      lastSeen: user!.lastSeen,
                      language: user!.language,
                      theme: user!.theme,
                      createdAt: user!.createdAt,
                      updatedAt: user!.updatedAt,
                    },
                  },
                ],
              }
            : story
        )
      );
    } catch (error) {
      console.error('Error reacting to story:', error);
      toast.error('Failed to react to story');
    }
  };

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stories</h1>
          <p className="text-gray-600 mb-8">Please log in to view stories</p>
          <a href="/auth/login" className="btn-primary">
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="stories" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Stories</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
                aria-label="Add new story"
              >
                <Plus className="w-5 h-5" />
                <span>Add Story</span>
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading stories...</p>
              </div>
            ) : stories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
                <p className="text-gray-600 mb-4">Be the first to share a story!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                  aria-label="Create your first story"
                >
                  Create Your First Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    role="button"
                    tabIndex={0}
                    aria-label={`View story by ${story.author?.firstName} ${story.author?.lastName}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedStory(story);
                      }
                    }}
                  >
                    <div className="aspect-square relative">
                      {story.mediaType === 'image' ? (
                        <img
                          src={story.mediaUrl}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                      ) : story.mediaType === 'video' ? (
                        <video
                          src={story.mediaUrl}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                          <div className="text-center text-white">
                            <p className="text-lg font-bold">{story.mediaUrl}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👁️</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {story.author?.avatar ? (
                          <img
                            src={story.author.avatar}
                            alt={story.author.username}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {story.author?.firstName?.[0]}
                          </div>
                        )}
                        <span className="font-semibold text-gray-900">
                          {story.author?.firstName} {story.author?.lastName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                      {story.reactions && story.reactions.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">
                            {story.reactions.length} reaction{story.reactions.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Story</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close create story modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo or Video
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full"
                  aria-label="Upload photo or video for story"
                />
              </div>

              {uploadFile && (
                <div className="text-sm text-gray-600">
                  Selected: {uploadFile.name}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  aria-label="Cancel story creation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || isUploading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Create and upload story"
                >
                  {isUploading ? 'Uploading...' : 'Create Story'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {selectedStory && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedStory(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
              aria-label="Close story viewer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-w-md w-full mx-4">
              {selectedStory.mediaType === 'image' ? (
                <img
                  src={selectedStory.mediaUrl}
                  alt="Story"
                  className="w-full rounded-lg"
                />
              ) : selectedStory.mediaType === 'video' ? (
                <video
                  src={selectedStory.mediaUrl}
                  controls
                  autoPlay
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">{selectedStory.mediaUrl}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedStory.author?.avatar ? (
                    <img
                      src={selectedStory.author.avatar}
                      alt={selectedStory.author.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-900 font-semibold text-sm">
                      {selectedStory.author?.firstName?.[0]}
                    </div>
                  )}
                  <span className="text-white font-semibold">
                    {selectedStory.author?.firstName} {selectedStory.author?.lastName}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {['🤝', '😍', '😢', '❤️', '😮'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(selectedStory.id, emoji)}
                      className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 text-white text-xl hover:scale-125 hover:rotate-12 transition-all duration-300 ease-out"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {selectedStory.reactions && selectedStory.reactions.length > 0 && (
                <div className="mt-4 bg-black bg-opacity-50 rounded-lg p-3">
                  <h4 className="text-white font-semibold mb-2">Reactions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStory.reactions.map((reaction) => (
                      <div
                        key={reaction.id}
                        className="flex items-center space-x-1 bg-white bg-opacity-20 rounded-full px-2 py-1"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-white text-sm">{reaction.user?.firstName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}