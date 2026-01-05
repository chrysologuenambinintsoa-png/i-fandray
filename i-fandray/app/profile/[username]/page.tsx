'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { PostCard } from '@/components/PostCard';
import { Edit, MapPin, Calendar, Mail, Link as LinkIcon, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { User, Post } from '@/types';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'videos'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const username = params.username as string;
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch user data from API
        const userResponse = await fetch(`/api/users?username=${username}`);
        if (!userResponse.ok) {
          if (userResponse.status === 404) {
            setError('User not found');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user's posts
        const postsResponse = await fetch(`/api/posts?authorId=${userData.id}&limit=20`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex pt-16">
          <Sidebar currentPage="profile" />
          <main className="flex-1 lg:ml-64">
            <div className="max-w-4xl mx-auto p-6">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading profile...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="flex pt-16">
          <Sidebar currentPage="profile" />
          <main className="flex-1 lg:ml-64">
            <div className="max-w-4xl mx-auto p-6">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {error === 'User not found' ? 'User Not Found' : 'Error Loading Profile'}
                </h1>
                <p className="text-gray-600 mb-6">
                  {error === 'User not found'
                    ? `The user @${username} doesn't exist or has been deleted.`
                    : 'There was an error loading this profile. Please try again later.'
                  }
                </p>
                <button
                  onClick={() => router.push('/feed')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Back to Feed
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'posts' as const, label: 'Posts', count: posts.length },
    { id: 'photos' as const, label: 'Photos', count: 24 },
    { id: 'videos' as const, label: 'Videos', count: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex pt-16">
        <Sidebar currentPage="profile" />
        
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            {/* Cover Photo */}
            <div className="relative h-64 bg-gradient-to-r from-green-600 to-blue-600 fancy-gradient overflow-hidden rounded-b-2xl">
              {user.coverPhoto ? (
                <img
                  src={user.coverPhoto}
                  alt="Cover"
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-green-500 to-blue-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              {isOwnProfile && (
                <button className="absolute bottom-4 right-4 bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold hover:shadow-md transition-shadow">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Edit Cover
                </button>
              )}
            </div>

            {/* Profile Header */}
            <div className="relative px-6 pb-6 bg-white border-b border-gray-200">
              {/* Avatar */}
              <div className="absolute -top-20 left-6">
                <div className="relative">
                  <img
                    src={user.avatar || 'https://via.placeholder.com/150'}
                    alt={user.username}
                    className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg story-ring"
                  />
                  {isOwnProfile && (
                    <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors" title="Change profile picture">
                      <Camera className="w-4 h-4 text-gray-700" />
                    </button>
                  )}
                  {user.isVerified && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="pt-20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                      {user.firstName} {user.lastName}
                      {user.isVerified && (
                        <svg className="w-6 h-6 ml-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </h1>
                    <p className="text-gray-600">@{user.username}</p>
                  </div>
                  
                  {isOwnProfile ? (
                    <button
                      onClick={() => router.push('/settings')}
                      className="flex items-center space-x-2 px-6 py-2 bg-white/90 rounded-full font-semibold shadow-sm hover:scale-105 transform transition"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <button className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-full font-semibold hover:shadow-lg transition-transform transform hover:-translate-y-0.5">
                        Follow
                      </button>
                      <button className="px-4 py-2 bg-white/90 hover:shadow-md rounded-full font-medium transition-colors">
                        Message
                      </button>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <p className="text-gray-900 mb-4">{user.bio}</p>
                )}

                {/* Details */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                  {user.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="flex items-center space-x-2">
                      <LinkIcon className="w-4 h-4" />
                      <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-8 border-t border-gray-200 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">5.6K</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">892</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10">
              <div className="max-w-4xl mx-auto px-6">
                <div className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'border-green-600 text-green-700'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-2 text-sm text-gray-500">({tab.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={(id) => console.log('Liked:', id)}
                        onComment={(id) => console.log('Commented:', id)}
                        onShare={(id) => console.log('Shared:', id)}
                        onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600">No posts yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000000}?w=400`}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-${1510000000000 + i * 1000000000}?w=600`}
                        alt={`Video ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}