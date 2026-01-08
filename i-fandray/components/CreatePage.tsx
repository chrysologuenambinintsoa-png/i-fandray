'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Page {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  category?: string;
  website?: string;
  isVerified: boolean;
  followerCount: number;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface CreatePageProps {
  pageId?: string; // If provided, edit mode
}

export default function CreatePage({ pageId }: CreatePageProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'posts'>('create');
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    website: '',
    avatar: '',
    coverPhoto: ''
  });
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPage = useCallback(async () => {
    try {
      const res = await fetch(`/api/pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
        setFormData({
          name: data.name,
          description: data.description || '',
          category: data.category || '',
          website: data.website || '',
          avatar: data.avatar || '',
          coverPhoto: data.coverPhoto || ''
        });
      }
    } catch (error) {
      console.error('Error fetching page:', error);
    }
  }, [pageId]);

  const fetchPosts = useCallback(async () => {
    if (!pageId) return;
    try {
      const res = await fetch(`/api/pages/${pageId}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [pageId]);

  useEffect(() => {
    if (pageId) {
      fetchPage();
      setActiveTab('manage');
    }
  }, [pageId, fetchPage]);

  useEffect(() => {
    if (activeTab === 'posts' && pageId) {
      fetchPosts();
    }
  }, [activeTab, pageId, fetchPosts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = pageId ? `/api/pages/${pageId}` : '/api/pages';
      const method = pageId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setPage(data);
        if (!pageId) {
          setActiveTab('manage');
        }
        alert(pageId ? 'Page updated successfully!' : 'Page created successfully!');
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId || !postContent.trim()) return;

    try {
      const res = await fetch(`/api/pages/${pageId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          mediaType: 'text'
        })
      });

      if (res.ok) {
        setPostContent('');
        fetchPosts();
        alert('Post created and shared on feed!');
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('An error occurred');
    }
  };

  if (!session) {
    return <div>Please sign in to manage pages.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10">
        <h1 className="text-2xl font-bold mb-6 text-white">
          {pageId ? 'Manage Page' : 'Create Page'}
        </h1>

        {pageId && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'}`}
            >
              Manage Page
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded ${activeTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white'}`}
            >
              Posts & Sharing
            </button>
          </div>
        )}

        {activeTab === 'create' || activeTab === 'manage' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="page-name" className="block text-sm font-semibold text-white mb-2">Page Name *</label>
              <input
                id="page-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 text-white placeholder-white/60 transition-all duration-300"
                required
              />
            </div>

            <div>
              <label htmlFor="page-description" className="block text-sm font-semibold text-white mb-2">Description</label>
              <textarea
                id="page-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 text-white placeholder-white/60 transition-all duration-300"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="page-category" className="block text-sm font-semibold text-white mb-2">Category</label>
                <select
                  id="page-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                >
                  <option value="">Select category</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="education">Education</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="page-website" className="block text-sm font-semibold text-white mb-2">Website</label>
                <input
                  id="page-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div>
                <label htmlFor="page-avatar" className="block text-sm font-semibold text-white mb-2">Avatar URL</label>
                <input
                  id="page-avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                />
                {formData.avatar && (
                  <img src={formData.avatar} alt="avatar preview" className="mt-3 w-20 h-20 rounded-full object-cover border border-white/10" />
                )}
              </div>

              <div>
                <label htmlFor="page-cover" className="block text-sm font-semibold text-white mb-2">Cover Photo URL</label>
                <input
                  id="page-cover"
                  type="url"
                  value={formData.coverPhoto}
                  onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white"
                />
                {formData.coverPhoto && (
                  <div className="mt-3 w-full h-24 rounded-lg overflow-hidden border border-white/10">
                    <img src={formData.coverPhoto} alt="cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 via-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
              </button>
              {pageId && (
                <button type="button" onClick={() => { setFormData({ name: '', description: '', category: '', website: '', avatar: '', coverPhoto: '' }); setPage(null); }} className="px-4 py-3 rounded-xl bg-white/10 text-white">Reset</button>
              )}
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Create Post from Page</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label htmlFor="post-content" className="block text-sm font-semibold text-white mb-2">Post Content</label>
                <textarea
                  id="post-content"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60"
                  rows={4}
                  placeholder="Share something on the feed..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-xl"
              >
                Share on Feed
              </button>
            </form>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Recent Posts</h3>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded p-4 bg-white/3">
                    <p className="text-white">{post.content}</p>
                    <div className="text-sm text-gray-300 mt-2">
                      By {post.author.firstName} {post.author.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-300">
                      {post._count.likes} likes • {post._count.comments} comments • {post._count.shares} shares
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}