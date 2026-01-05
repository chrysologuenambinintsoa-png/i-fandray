'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { User, Post } from '@/types';
import { useTranslation } from '@/components/TranslationProvider';
import { Search, Users, FileText, Hash } from 'lucide-react';

interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult>({ users: [], posts: [], hashtags: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'hashtags'>('all');
  const { t } = useTranslation();

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const renderUserResult = (user: User) => (
    <div key={user.id} className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
        {user.avatar ? (
          <img src={user.avatar} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
        ) : (
          user.firstName?.[0]?.toUpperCase() || '?'
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {user.firstName} {user.lastName}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
      </div>
      <div className="flex items-center space-x-2">
        {user.isOnline && (
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {user.isOnline ? 'En ligne' : 'Hors ligne'}
        </span>
      </div>
    </div>
  );

  const renderPostResult = (post: Post) => (
    <div key={post.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          {post.author?.avatar ? (
            <img src={post.author.avatar} alt={post.author.firstName} className="w-full h-full rounded-full object-cover" />
          ) : (
            post.author?.firstName?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {post.author?.firstName} {post.author?.lastName}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
      {post.media && post.media.length > 0 && (
        <div className="mt-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            📎 {post.media.length} média{post.media.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );

  const renderHashtagResult = (hashtag: string) => (
    <div key={hashtag} className="flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
      <Hash className="w-5 h-5 text-blue-500" />
      <span className="font-semibold text-gray-900 dark:text-white">#{hashtag}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      <div className="flex pt-16">
        <Sidebar currentPage="search" />

        <main className="flex-1 lg:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              {/* Search Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('search.results')} &quot;{query}&quot;
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {results.users.length + results.posts.length + results.hashtags.length} résultat{results.users.length + results.posts.length + results.hashtags.length > 1 ? 's' : ''} trouvé{results.users.length + results.posts.length + results.hashtags.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Search Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Tout ({results.users.length + results.posts.length + results.hashtags.length})
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'users'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Utilisateurs ({results.users.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'posts'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Publications ({results.posts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('hashtags')}
                  className={`flex items-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'hashtags'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span>Hashtags ({results.hashtags.length})</span>
                </button>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Recherche en cours...</span>
                </div>
              )}

              {/* Search Results */}
              {!isLoading && (
                <div className="space-y-6">
                  {/* All Results */}
                  {activeTab === 'all' && (
                    <>
                      {results.users.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Utilisateurs
                          </h2>
                          <div className="space-y-2">
                            {results.users.slice(0, 5).map(renderUserResult)}
                          </div>
                        </div>
                      )}

                      {results.posts.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Publications
                          </h2>
                          <div className="space-y-4">
                            {results.posts.slice(0, 10).map(renderPostResult)}
                          </div>
                        </div>
                      )}

                      {results.hashtags.length > 0 && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Hash className="w-5 h-5 mr-2" />
                            Hashtags
                          </h2>
                          <div className="space-y-2">
                            {results.hashtags.slice(0, 10).map(renderHashtagResult)}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Users Only */}
                  {activeTab === 'users' && (
                    <div className="space-y-2">
                      {results.users.length > 0 ? (
                        results.users.map(renderUserResult)
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          Aucun utilisateur trouvé pour &quot;{query}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Posts Only */}
                  {activeTab === 'posts' && (
                    <div className="space-y-4">
                      {results.posts.length > 0 ? (
                        results.posts.map(renderPostResult)
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          Aucune publication trouvée pour &quot;{query}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Hashtags Only */}
                  {activeTab === 'hashtags' && (
                    <div className="space-y-2">
                      {results.hashtags.length > 0 ? (
                        results.hashtags.map(renderHashtagResult)
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          Aucun hashtag trouvé pour &quot;{query}&quot;
                        </p>
                      )}
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