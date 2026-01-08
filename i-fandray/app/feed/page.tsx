'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CreatePost } from '@/components/CreatePost';
import { WelcomeTips } from '@/components/WelcomeTips';
import { StoryTray } from '@/components/StoryTray';
import { PostCard } from '@/components/PostCard';
import { OnlineFriendsList } from '@/components/OnlineFriendsList';
import { Post, Story } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';
import toast from 'react-hot-toast';
import { uploadToCloudinary } from '@/lib/upload';

// Lazy load heavy components
const FriendSuggestionsCard = lazy(() => import('@/components/FriendSuggestionsCard').then(mod => ({ default: mod.FriendSuggestionsCard })));
const SuggestionsCard = lazy(() => import('@/components/SuggestionsCard').then(mod => ({ default: mod.SuggestionsCard })));
const DiscoverPagesCard = lazy(() => import('@/components/DiscoverPagesCard').then(mod => ({ default: mod.DiscoverPagesCard })));
const DiscoverGroupsCard = lazy(() => import('@/components/DiscoverGroupsCard').then(mod => ({ default: mod.DiscoverGroupsCard })));

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [storyUploadFile, setStoryUploadFile] = useState<File | null>(null);
  const [storyText, setStoryText] = useState('');
  const [isStoryUploading, setIsStoryUploading] = useState(false);

  const fetchPosts = async (pageNum = 1, append = false) => {
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      const newPosts = data.posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
        author: {
          ...post.author,
          createdAt: new Date(post.author.createdAt),
          updatedAt: new Date(post.author.updatedAt),
        },
        comments: post.comments?.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
          author: comment.author ? {
            ...comment.author,
            createdAt: new Date(comment.author.createdAt),
            updatedAt: new Date(comment.author.updatedAt),
          } : undefined,
        })) || [],
        likes: post.likes || [],
        shares: post.shares || [],
      }));

      if (append) {
        setPosts(prev => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories');
      if (!response.ok) {
        throw new Error('Failed to fetch stories');
      }

      const data = await response.json();
      setStories(data.map((story: any) => ({
        ...story,
        createdAt: new Date(story.createdAt),
        expiresAt: new Date(story.expiresAt),
        author: {
          ...story.author,
          createdAt: new Date(story.author.createdAt),
          updatedAt: new Date(story.author.updatedAt),
        },
        reactions: story.reactions?.map((reaction: any) => ({
          ...reaction,
          createdAt: new Date(reaction.createdAt),
          user: reaction.user ? {
            ...reaction.user,
            createdAt: new Date(reaction.user.createdAt),
            updatedAt: new Date(reaction.user.updatedAt),
          } : undefined,
        })) || [],
      })));
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && user === null) { // Only redirect if not loading and explicitly not authenticated
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      console.log('User authenticated, fetching posts and stories');
      fetchPosts();
      fetchStories();
    }
  }, [user]);

const handlePost = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = async (postId: string, emoji?: string) => {
    try {
      const postIndex = posts.findIndex(p => p.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];
      const isLiked = post.likes && post.likes.length > 0;
      const currentEmoji = isLiked ? post.likes?.[0]?.emoji : null;

      let method: string;

      if (emoji) {
        if (isLiked && currentEmoji === emoji) {
          method = 'DELETE';
        } else {
          method = 'POST';
        }
      } else {
        method = isLiked ? 'DELETE' : 'POST';
      }

      const body = emoji ? JSON.stringify({ emoji }) : undefined;

      const response = await fetch(`/api/posts/${postId}/likes`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${method === 'DELETE' ? 'unlike' : 'like'} post`);
      }

      // Update local state
      const updatedPosts = [...posts];
      if (method === 'POST') {
        const like = await response.json();
        updatedPosts[postIndex] = {
          ...post,
          likes: [like],
          _count: {
            comments: post._count?.comments ?? 0,
            likes: (post._count?.likes ?? 0) + 1,
            shares: post._count?.shares ?? 0,
          },
        };
      } else {
        updatedPosts[postIndex] = {
          ...post,
          likes: [],
          _count: {
            comments: post._count?.comments ?? 0,
            likes: Math.max(0, (post._count?.likes ?? 0) - 1),
            shares: post._count?.shares ?? 0,
          },
        };
      }

      setPosts(updatedPosts);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to toggle like');
    }
  };

  const handleComment = (postId: string) => {
    // Handle comment logic - could open a modal or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleShare = async (postId: string, type?: 'message' | 'group') => {
    if (type === 'message') {
      router.push('/messages');
    } else if (type === 'group') {
      router.push('/groups');
    } else {
      try {
        const response = await fetch(`/api/posts/${postId}/shares`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: 'Shared this post',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to share post');
        }

        toast.success('Post shared successfully!');
        // Refresh posts to show the share
        fetchPosts();
      } catch (error) {
        console.error('Error sharing post:', error);
        toast.error('Failed to share post');
      }
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      // Remove post from local state
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleCreateStory = () => {
    setShowCreateStoryModal(true);
  };

  const handleViewStory = (storyId: string) => {
    // Navigate to stories page for viewing
    window.location.href = `/stories?view=${storyId}`;
  };

  const handleStoryUpload = async () => {
    if (!storyUploadFile && !storyText.trim()) return;

    setIsStoryUploading(true);
    try {
      let mediaUrl = '';
      let mediaType: 'text' | 'image' | 'video' = 'text';

      if (storyUploadFile) {
        // Upload file to Cloudinary
        const uploadData = await uploadToCloudinary(storyUploadFile, { folder: 'stories' });
        mediaUrl = uploadData.secure_url || uploadData.url;
        mediaType = storyUploadFile.type.startsWith('video/') ? 'video' : 'image';
      } else {
        // For text stories, we can create a simple text-based story
        mediaUrl = storyText;
        mediaType = 'text';
      }

      // Create story
      const storyResponse = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaUrl,
          mediaType,
          duration: mediaType === 'text' ? 3000 : 5000, // 3 seconds for text, 5 for media
        }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to create story');
      }

      const newStory = await storyResponse.json();
      setStories(prev => [newStory, ...prev]);
      setShowCreateStoryModal(false);
      setStoryUploadFile(null);
      setStoryText('');
      toast.success('Story created successfully!');
    } catch (error) {
      console.error('Error creating story:', error);
      toast.error('Failed to create story');
    } finally {
      setIsStoryUploading(false);
    }
  };

  const { t } = useTranslation();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('feed.welcome')}</h1>
          <p className="text-muted-foreground mb-8">{t('feed.loginPrompt')}</p>
          <a href="/auth/login" className="btn-primary">
            {t('auth.login')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="feed" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Stories */}
            <StoryTray stories={stories} onCreateStory={handleCreateStory} onViewStory={handleViewStory} />

            {/* Create Post */}
            <CreatePost onPost={handlePost} />

            {/* Friend Suggestions */}
            <Suspense fallback={<div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div></div>}>
              <FriendSuggestionsCard />
            </Suspense>

            {/* Online Friends */}
            <div className="bg-card rounded-lg shadow-sm p-4 mb-4">
              <OnlineFriendsList />
            </div>

            {/* Suggestions */}
            <Suspense fallback={<div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>}>
              <SuggestionsCard />
            </Suspense>

            {/* Discover Pages */}
            <Suspense fallback={<div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div></div>}>
              <DiscoverPagesCard />
            </Suspense>

            {/* Discover Groups */}
            <Suspense fallback={<div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div></div>}>
              <DiscoverGroupsCard />
            </Suspense>

            {/* Welcome Tips for New Users */}
            <WelcomeTips />

            {/* Posts Feed */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handleLike(post.id)}
                    onComment={() => handleComment(post.id)}
                    onShare={(postId, type) => handleShare(postId, type)}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Story Modal */}
      {showCreateStoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Story</h3>
              <button
                onClick={() => setShowCreateStoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
                aria-label="Close create story modal"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Text Story */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Story
                </label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              {/* Or */}
              <div className="text-center text-gray-500">or</div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photo/Video
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setStoryUploadFile(e.target.files?.[0] || null)}
                  className="w-full"
                  aria-label="Upload photo or video for story"
                />
                {storyUploadFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {storyUploadFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateStoryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStoryUpload}
                disabled={(!storyText.trim() && !storyUploadFile) || isStoryUploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStoryUploading ? 'Creating...' : 'Create Story'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}