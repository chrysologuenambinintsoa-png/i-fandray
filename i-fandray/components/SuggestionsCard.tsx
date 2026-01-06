'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/components/TranslationProvider';
import { UserPlus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SuggestedPage {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  category?: string;
  followerCount: number;
  creator: {
    firstName: string;
    lastName: string;
  };
}

interface SuggestedGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  category?: string;
  memberCount: number;
  privacy: string;
  creator: {
    firstName: string;
    lastName: string;
  };
}

interface SuggestionsData {
  pages: SuggestedPage[];
  groups: SuggestedGroup[];
}

export function SuggestionsCard() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<SuggestionsData>({ pages: [], groups: [] });
  const [loading, setLoading] = useState(true);
  const [followingPages, setFollowingPages] = useState<Set<string>>(new Set());
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);

        // Check which pages user is following and which groups user has joined
        const followingResponse = await fetch('/api/user/following');
        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          setFollowingPages(new Set(followingData.pages.map((p: any) => p.id)));
          setJoinedGroups(new Set(followingData.groups.map((g: any) => g.id)));
        }
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const handleFollowPage = async (pageId: string) => {
    try {
      const response = await fetch(`/api/pages/${pageId}/follow`, {
        method: 'POST',
      });

      if (response.ok) {
        setFollowingPages(prev => new Set([...prev, pageId]));
        toast.success('Page suivie avec succès !');
      } else {
        toast.error('Erreur lors du suivi de la page');
      }
    } catch (error) {
      console.error('Error following page:', error);
      toast.error('Erreur lors du suivi de la page');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        setJoinedGroups(prev => new Set([...prev, groupId]));
        toast.success('Groupe rejoint avec succès !');
      } else {
        toast.error('Erreur lors de la rejoint du groupe');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Erreur lors de la rejoint du groupe');
    }
  };

  const scrollLeft = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (containerId: string) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4">
            <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.pages.length === 0 && suggestions.groups.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Suggestions pour vous
      </h2>

      {/* Pages Section */}
      {suggestions.pages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
            Pages suggérées
          </h3>
          <div className="relative">
            <button
              onClick={() => scrollLeft('pages-container')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Faire défiler les pages vers la gauche"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div
              id="pages-container"
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestions.pages.map((page) => (
                <div
                  key={page.id}
                  className="flex-shrink-0 w-48 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {page.avatar ? (
                        <img src={page.avatar} alt={page.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        page.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {page.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {page.followerCount} abonné{page.followerCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {page.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {page.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {page.id.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => handleFollowPage(page.id)}
                      disabled={followingPages.has(page.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        followingPages.has(page.id)
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {followingPages.has(page.id) ? 'Suivi' : 'Suivre'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollRight('pages-container')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Faire défiler les pages vers la droite"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}

      {/* Groups Section */}
      {suggestions.groups.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            Groupes suggérés
          </h3>
          <div className="relative">
            <button
              onClick={() => scrollLeft('groups-container')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Faire défiler les groupes vers la gauche"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div
              id="groups-container"
              className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {suggestions.groups.map((group) => (
                <div
                  key={group.id}
                  className="flex-shrink-0 w-48 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                      {group.avatar ? (
                        <img src={group.avatar} alt={group.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        group.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {group.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {group.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {group.id.slice(0, 8)}...
                    </span>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={joinedGroups.has(group.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        joinedGroups.has(group.id)
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {joinedGroups.has(group.id) ? 'Rejoint' : 'Rejoindre'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollRight('groups-container')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-700 shadow-lg rounded-full p-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              aria-label="Faire défiler les groupes vers la droite"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}