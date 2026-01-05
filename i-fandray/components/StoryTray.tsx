'use client';

import { Plus, Play } from 'lucide-react';
import { useState } from 'react';
import { Story } from '@/types';
import { useTranslation } from '@/components/TranslationProvider';

interface StoryTrayProps {
  stories?: Story[];
  onCreateStory?: () => void;
  onViewStory?: (storyId: string) => void;
}

export function StoryTray({ stories = [], onCreateStory, onViewStory }: StoryTrayProps) {
  const { t } = useTranslation();
  const [hoveredStory, setHoveredStory] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-4 overflow-x-auto">
      <div className="flex space-x-4">
        {/* Create Story Button */}
        <div
          onClick={onCreateStory}
          className="flex-shrink-0 w-32 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-32 h-48 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black bg-opacity-30"></div>
              <img
                src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400"
                alt="Create story"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center absolute -top-5 left-1/2 transform -translate-x-1/2">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-xs font-semibold text-center mt-4">
                {t('story.createStory')}
              </p>
            </div>
          </div>
        </div>

        {/* Stories */}
        {stories.map((story) => (
          <div
            key={story.id}
            onClick={() => onViewStory?.(story.id)}
            className="flex-shrink-0 w-32 cursor-pointer group"
            onMouseEnter={() => setHoveredStory(story.id)}
            onMouseLeave={() => setHoveredStory(null)}
          >
            <div className="relative">
              {/* Story Ring */}
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <div className="w-32 h-48 rounded-lg overflow-hidden bg-gray-100">
                  <div className="relative w-full h-full">
                    <img
                      src={story.mediaUrl}
                      alt={story.author?.username || 'Story'}
                      className="w-full h-full object-cover"
                    />
                    {hoveredStory === story.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Avatar */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white overflow-hidden z-10">
                {story.author?.avatar ? (
                  <img
                    src={story.author.avatar}
                    alt={story.author.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-600 flex items-center justify-center text-white font-semibold">
                    {story.author?.firstName?.[0] || 'U'}
                  </div>
                )}
              </div>

              {/* User Name */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                <p className="text-white text-xs font-semibold text-center truncate">
                  {story.author?.firstName} {story.author?.lastName}
                </p>
                {story.viewers > 0 && (
                  <p className="text-white text-xs text-center opacity-80">
                    {story.viewers} views
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}