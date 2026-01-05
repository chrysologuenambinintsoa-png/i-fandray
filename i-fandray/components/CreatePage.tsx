'use client';

import { useState, useEffect, useCallback } from 'react';
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
      <h1 className="text-2xl font-bold mb-6">
        {pageId ? 'Manage Page' : 'Create Page'}
      </h1>

      {pageId && (
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Manage Page
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded ${activeTab === 'posts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Posts & Sharing
          </button>
        </div>
      )}

      {activeTab === 'create' || activeTab === 'manage' ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="page-name" className="block text-sm font-medium mb-1">Page Name *</label>
            <input
              id="page-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="page-description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="page-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="page-category" className="block text-sm font-medium mb-1">Category</label>
            <select
              id="page-category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
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
            <label htmlFor="page-website" className="block text-sm font-medium mb-1">Website</label>
            <input
              id="page-website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="page-avatar" className="block text-sm font-medium mb-1">Avatar URL</label>
            <input
              id="page-avatar"
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="page-cover" className="block text-sm font-medium mb-1">Cover Photo URL</label>
            <input
              id="page-cover"
              type="url"
              value={formData.coverPhoto}
              onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : pageId ? 'Update Page' : 'Create Page'}
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create Post from Page</h2>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label htmlFor="post-content" className="block text-sm font-medium mb-1">Post Content</label>
              <textarea
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
                placeholder="Share something on the feed..."
                required
              />
            </div>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Share on Feed
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="border rounded p-4">
                  <p>{post.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    By {post.author.firstName} {post.author.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {post._count.likes} likes • {post._count.comments} comments • {post._count.shares} shares
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}