'use client';

import { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { VideoCall } from '@/components/VideoCall';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, Message } from '@/types';
import { EncryptedMessageDisplay } from '@/components/EncryptedMessageDisplay';
import { EncryptedMessageInput } from '@/components/EncryptedMessageInput';

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDeleteOptions, setShowDeleteOptions] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleDeleteMessage = async (messageId: string, deleteType: 'for-me' | 'for-everyone' = 'for-me') => {
    if (!selectedConversation) return;
    try {
      const res = await fetch(`/api/conversations/${selectedConversation.id}/messages/${messageId}?type=${deleteType}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setShowDeleteOptions(null);
      toast.success(deleteType === 'for-everyone' ? 'Message deleted for everyone' : 'Message deleted for you');
    } catch (e) {
      console.error('Delete message error', e);
      toast.error('Failed to delete message');
    }
  };

  const handleVideoCall = () => {
    if (selectedConversation) {
      setIsVideoCallActive(true);
    } else {
      toast.error('Please select a conversation first');
    }
  };

  const handleVoiceCall = () => {
    if (selectedConversation) {
      setIsVoiceCallActive(true);
    } else {
      toast.error('Please select a conversation first');
    }
  };

  const handleEndCall = () => {
    setIsVideoCallActive(false);
    setIsVoiceCallActive(false);
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteOptions && !(event.target as Element).closest('.delete-options')) {
        setShowDeleteOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeleteOptions]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
          <p className="text-gray-600 mb-8">Please log in to view your messages</p>
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
        <Sidebar currentPage="messages" />

        <main className="flex-1 lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-md h-[calc(100vh-8rem)] flex">
              {/* Conversations Sidebar */}
              <div className="w-1/3 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading conversations...</p>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No conversations yet</p>
                      <p className="text-sm text-gray-500">Start a conversation to connect with others</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {conversations
                        .filter(conv =>
                          conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((conversation) => (
                          <button
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              selectedConversation?.id === conversation.id ? 'bg-green-50 border-r-2 border-green-600' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {conversation.avatar ? (
                                <img
                                  src={conversation.avatar}
                                  alt={conversation.name || 'Conversation'}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {conversation.name?.[0] || 'C'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">
                                  {conversation.name || 'Unnamed Conversation'}
                                </p>
                                {conversation.lastMessage && (
                                  <p className="text-sm text-gray-600 truncate">
                                    {conversation.lastMessage.content}
                                  </p>
                                )}
                              </div>
                              {(conversation.unreadCount || 0) > 0 && (
                                <div className="bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {conversation.unreadCount || 0}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversation ? (
                  <>
                    {/* Message Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        {selectedConversation.avatar ? (
                          <img
                            src={selectedConversation.avatar}
                            alt={selectedConversation.name || 'Conversation'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {selectedConversation.name?.[0] || 'C'}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {selectedConversation.name || 'Unnamed Conversation'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {selectedConversation.type === 'group' ? 'Group conversation' : 'Private conversation'}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-auto">
                          <button
                            onClick={handleVoiceCall}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voice Call"
                          >
                            <Phone className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleVideoCall}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Video Call"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          {(message as any).isEncrypted ? (
                            <EncryptedMessageDisplay
                              content={message.content || '[Message chiffré]'}
                              encryptedData={(message as any).encryptedData ? {
                                ciphertext: (message as any).encryptedData.ciphertext,
                                iv: (message as any).encryptedData.iv,
                                salt: (message as any).encryptedData.salt,
                                algorithm: (message as any).encryptedData.algorithm,
                                keyId: (message as any).encryptionKeyId,
                              } : undefined}
                              senderId={message.senderId}
                              timestamp={new Date(message.createdAt)}
                              className={message.senderId === user.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-900'}
                            />
                          ) : (
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderId === user.id
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p>{message.content}</p>
                              {(message as any).attachments && (message as any).attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {(message as any).attachments.map((att: any, i: number) => (
                                    <div key={i} className="relative">
                                      {att.type === 'image' ? (
                                        <img src={att.url} alt={att.name || 'attachment'} className="w-48 h-auto rounded-lg max-w-full" />
                                      ) : att.type === 'video' ? (
                                        <video src={att.url} controls className="w-64 h-auto rounded-lg max-w-full" />
                                      ) : att.type === 'audio' ? (
                                        <audio src={att.url} controls className="w-64 max-w-full" />
                                      ) : (
                                        <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                          <div className="text-2xl">📄</div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{att.name || 'Document'}</p>
                                            <p className="text-xs text-gray-500">Click to download</p>
                                          </div>
                                          <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-500 hover:text-blue-700"
                                            aria-label="Download attachment"
                                          >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2 relative">
                                <p className={`text-xs ${
                                  message.senderId === user.id ? 'text-green-100' : 'text-gray-500'
                                }`}>{new Date(message.createdAt).toLocaleTimeString()}</p>
                                {message.senderId === user.id && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setShowDeleteOptions(showDeleteOptions === message.id ? null : message.id)}
                                      className="text-xs text-red-500 hover:text-red-700 p-1"
                                      aria-label="Delete message options"
                                    >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                  {showDeleteOptions === message.id && (
                                    <div className="delete-options absolute bottom-full right-0 mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                                      <button
                                        onClick={() => handleDeleteMessage(message.id, 'for-me')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                                      >
                                        Delete for me
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(message.id, 'for-everyone')}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg text-red-600 hover:text-red-700"
                                      >
                                        Delete for everyone
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200">
                      {selectedConversation && (
                        <EncryptedMessageInput
                          conversationId={selectedConversation.id}
                          recipientId={selectedConversation.participants.find(p => p.id !== user.id)?.id || ''}
                          onMessageSent={(message) => {
                            setMessages(prev => [...prev, message]);
                          }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-600">Choose a conversation from the sidebar to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Video Call Modal */}
      {isVideoCallActive && (
        <VideoCall
          isVideo={true}
          participants={selectedConversation ? [{
            id: selectedConversation.id,
            name: selectedConversation.name || 'Unknown',
            avatar: selectedConversation.avatar
          }] : []}
          onEndCall={handleEndCall}
        />
      )}

      {/* Voice Call Modal */}
      {isVoiceCallActive && (
        <VideoCall
          isVideo={false}
          participants={selectedConversation ? [{
            id: selectedConversation.id,
            name: selectedConversation.name || 'Unknown',
            avatar: selectedConversation.avatar
          }] : []}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
}