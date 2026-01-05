'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CreatePost } from '@/components/CreatePost';
import { PostCard } from '@/components/PostCard';
import { useAuth } from '@/hooks/useAuth';
import { Group, GroupPost, Post } from '@/types';
import { Users, Settings, Plus, Edit, Trash2, UserPlus, UserMinus, Crown, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    description: '',
    privacy: 'public' as 'public' | 'private',
    rules: '',
  });

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch group');
      }
      const data = await response.json();
      setGroup(data.group);
      setMembers(data.members);
      setIsMember(data.isMember);
      setIsAdmin(data.isAdmin);

      // Set settings form
      setSettingsForm({
        name: data.group.name,
        description: data.group.description || '',
        privacy: data.group.privacy,
        rules: data.group.rules || '',
      });
    } catch (error) {
      console.error('Error fetching group:', error);
      toast.error('Failed to load group');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/posts`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      setPosts(data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/join`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to join group');
      }
      setIsMember(true);
      toast.success('Joined group successfully!');
      fetchGroup(); // Refresh member count
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  const leaveGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${id}/leave`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to leave group');
      }
      setIsMember(false);
      setIsAdmin(false);
      toast.success('Left group successfully!');
      fetchGroup(); // Refresh member count
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    }
  };

  const updateSettings = async () => {
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsForm),
      });
      if (!response.ok) {
        throw new Error('Failed to update group');
      }
      toast.success('Group updated successfully!');
      setShowSettings(false);
      fetchGroup();
    } catch (error) {
      console.error('Error updating group:', error);
      toast.error('Failed to update group');
    }
  };

  const deleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/groups/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete group');
      }
      toast.success('Group deleted successfully!');
      router.push('/groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    }
  };

  const handlePost = (post: any) => {
    setPosts(prev => [post, ...prev]);
    setShowCreatePost(false);
  };

  useEffect(() => {
    if (user && id) {
      fetchGroup();
      fetchPosts();
    }
  }, [user, id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Group</h1>
          <p className="text-gray-600 mb-8">Please log in to view this group</p>
          <a href="/auth/login" className="btn-primary">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex pt-16">
          <Sidebar currentPage="groups" />
          <main className="flex-1 lg:ml-64">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading group...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex pt-16">
          <Sidebar currentPage="groups" />
          <main className="flex-1 lg:ml-64">
            <div className="text-center py-8">
              <p className="text-gray-600">Group not found</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="groups" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Group Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              {group.coverPhoto && (
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${group.coverPhoto})` }}></div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    {group.avatar ? (
                      <img
                        src={group.avatar}
                        alt={group.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold text-2xl">
                        {group.name[0]}
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                      <p className="text-gray-600">{group.category} • {group.memberCount} members</p>
                      <p className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                        group.privacy === 'public'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {group.privacy}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isAdmin && (
                      <button
                        onClick={() => setShowSettings(true)}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    )}

                    {isMember ? (
                      <button
                        onClick={leaveGroup}
                        className="btn-secondary flex items-center space-x-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        <span>Leave Group</span>
                      </button>
                    ) : (
                      <button
                        onClick={joinGroup}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Join Group</span>
                      </button>
                    )}
                  </div>
                </div>

                {group.description && (
                  <p className="text-gray-700 mt-4">{group.description}</p>
                )}

                {group.rules && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Group Rules</h3>
                    <p className="text-gray-700 whitespace-pre-line">{group.rules}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Members Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Members ({members.length})</h2>
                {isAdmin && (
                  <button className="btn-secondary text-sm">
                    Manage Members
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.slice(0, 9).map((member: any) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={member.user.avatar || '/default-avatar.png'}
                      alt={member.user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{member.user.firstName} {member.user.lastName}</p>
                      <p className="text-sm text-gray-600">@{member.user.username}</p>
                      {member.role !== 'member' && (
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                          member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role === 'admin' && <Crown className="w-3 h-3 inline mr-1" />}
                          {member.role === 'moderator' && <Shield className="w-3 h-3 inline mr-1" />}
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts Section */}
            {isMember && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Post</span>
                </button>
              </div>
            )}

            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as Post}
                  onLike={() => {}}
                  onComment={() => {}}
                  onShare={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Group Settings</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  id="group-name"
                  name="groupName"
                  type="text"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="group-description"
                  name="description"
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="group-privacy" className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <select
                  id="group-privacy"
                  name="privacy"
                  value={settingsForm.privacy}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, privacy: e.target.value as 'public' | 'private' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rules
                </label>
                <textarea
                  value={settingsForm.rules}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, rules: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Group rules and guidelines..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateSettings}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>

              {isAdmin && group.creatorId === user.id && (
                <button
                  onClick={deleteGroup}
                  className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Group
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Create Group Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <CreatePost onPost={handlePost} groupId={id as string} />
          </div>
        </div>
      )}
    </div>
  );
}