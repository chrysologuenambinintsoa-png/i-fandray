'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Group } from '@/types';
import { Plus, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sponsored, setSponsored] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    privacy: 'public' as 'public' | 'private',
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = async () => {
    try {
      const [groupsResponse, sponsoredResponse] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/sponsored?placement=group')
      ]);

      if (!groupsResponse.ok) {
        throw new Error('Failed to fetch groups');
      }

      const groupsData = await groupsResponse.json();
      setGroups(groupsData.groups);

      if (sponsoredResponse.ok) {
        const sponsoredData = await sponsoredResponse.json();
        setSponsored(sponsoredData);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async () => {
    if (!createForm.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const newGroup = await response.json();
      setGroups(prev => [newGroup, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        category: '',
        privacy: 'public',
      });
      toast.success('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      // This would need a separate API endpoint for joining groups
      // For now, we'll just show a success message
      toast.success('Join request sent!');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to join group');
    }
  };

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Groups</h1>
          <p className="text-gray-600 mb-8">Please log in to view groups</p>
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
        <Sidebar currentPage="groups" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Group</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading groups...</p>
              </div>
            ) : (
              <>
                {/* Sponsored Content */}
                {sponsored.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Contenu Sponsorisé</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sponsored.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-32 object-cover"
                            />
                          )}
                          <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                                Sponsorisé
                              </span>
                              <span className="text-sm text-gray-600">{item.sponsorName}</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-700 text-sm mb-4">{item.content}</p>
                            <a
                              href={item.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                            >
                              En savoir plus
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Groups */}
                {groups
                  .filter(group =>
                    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((group) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => router.push(`/groups/${group.id}`)}
                    >
                      {group.coverPhoto && (
                        <img
                          src={group.coverPhoto}
                          alt={group.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            {group.avatar ? (
                              <img
                                src={group.avatar}
                                alt={group.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                                {group.name[0]}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{group.name}</h3>
                              <p className="text-sm text-gray-600">{group.category}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            group.privacy === 'public'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {group.privacy}
                          </span>
                        </div>

                        {group.description && (
                          <p className="text-gray-700 mb-4 line-clamp-2">{group.description}</p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount} members</span>
                          </div>
                          <button
                            onClick={() => joinGroup(group.id)}
                            className="btn-secondary text-sm"
                          >
                            Join Group
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Group</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Describe your group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Group category"
                >
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Sports">Sports</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Business">Business</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Privacy
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="public"
                      checked={createForm.privacy === 'public'}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, privacy: e.target.value as 'public' | 'private' }))}
                      className="mr-2"
                    />
                    Public
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="private"
                      checked={createForm.privacy === 'private'}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, privacy: e.target.value as 'public' | 'private' }))}
                      className="mr-2"
                    />
                    Private
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!createForm.name.trim() || isCreating}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}