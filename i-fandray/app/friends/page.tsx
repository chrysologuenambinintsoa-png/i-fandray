'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
}

interface Friend {
  id: string;
  friendId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
  isActive: boolean;
  friendshipDate: string;
}

interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'sent' | 'suggestions'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadFriendsData();
    }
  }, [status, router]);

  const loadFriendsData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, sentRes, suggestionsRes] = await Promise.all([
        fetch('/api/friends?type=friends'),
        fetch('/api/friends?type=requests'),
        fetch('/api/friends?type=sent'),
        fetch('/api/friends/suggestions')
      ]);

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }

      if (sentRes.ok) {
        const sentData = await sentRes.json();
        setSentRequests(sentData.sentRequests || []);
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json();
        setSuggestions(suggestionsData.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading friends data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async (action: string, userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/friends/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await loadFriendsData(); // Reload all data
      } else {
        const error = await response.json();
        alert(error.error || 'Action failed');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    setActionLoading(userId);
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: userId }),
      });

      if (response.ok) {
        await loadFriendsData(); // Reload all data
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Friends</h1>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
              {[
                { key: 'friends', label: 'My Friends', count: friends.length },
                { key: 'requests', label: 'Requests', count: requests.length },
                { key: 'sent', label: 'Sent', count: sentRequests.length },
                { key: 'suggestions', label: 'Suggestions', count: suggestions.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'friends' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">My Friends</h2>
                  {friends.length === 0 ? (
                    <p className="text-gray-500">No friends yet. Start connecting!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                          <img
                            src={friend.avatar || '/default-avatar.png'}
                            alt={`${friend.firstName} ${friend.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{friend.firstName} {friend.lastName}</h3>
                            <p className="text-sm text-gray-500">@{friend.username}</p>
                          </div>
                          <button
                            onClick={() => handleFriendAction('unfriend', friend.friendId)}
                            disabled={actionLoading === friend.friendId}
                            className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          >
                            {actionLoading === friend.friendId ? 'Removing...' : 'Unfriend'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
                  {requests.length === 0 ? (
                    <p className="text-gray-500">No pending friend requests.</p>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.sender.avatar || '/default-avatar.png'}
                              alt={`${request.sender.firstName} ${request.sender.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium">{request.sender.firstName} {request.sender.lastName}</h3>
                              <p className="text-sm text-gray-500">@{request.sender.username}</p>
                              {request.sender.bio && (
                                <p className="text-sm text-gray-600 mt-1">{request.sender.bio}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleFriendAction('accept', request.sender.id)}
                              disabled={actionLoading === request.sender.id}
                              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                              {actionLoading === request.sender.id ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleFriendAction('decline', request.sender.id)}
                              disabled={actionLoading === request.sender.id}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 disabled:opacity-50"
                            >
                              {actionLoading === request.sender.id ? 'Declining...' : 'Decline'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sent' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Sent Requests</h2>
                  {sentRequests.length === 0 ? (
                    <p className="text-gray-500">No sent friend requests.</p>
                  ) : (
                    <div className="space-y-4">
                      {sentRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <img
                              src={request.receiver.avatar || '/default-avatar.png'}
                              alt={`${request.receiver.firstName} ${request.receiver.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-medium">{request.receiver.firstName} {request.receiver.lastName}</h3>
                              <p className="text-sm text-gray-500">@{request.receiver.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleFriendAction('cancel', request.receiver.id)}
                            disabled={actionLoading === request.receiver.id}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            {actionLoading === request.receiver.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'suggestions' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Friend Suggestions</h2>
                  {suggestions.length === 0 ? (
                    <p className="text-gray-500">No suggestions available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {suggestions.map((user) => (
                        <div key={user.id} className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-3 mb-3">
                            <img
                              src={user.avatar || '/default-avatar.png'}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                              <p className="text-sm text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                          {user.bio && (
                            <p className="text-sm text-gray-600 mb-3">{user.bio}</p>
                          )}
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            disabled={actionLoading === user.id}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                          >
                            {actionLoading === user.id ? 'Sending...' : 'Add Friend'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}