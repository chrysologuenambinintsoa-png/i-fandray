'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, Users, Clock, X, RefreshCw } from 'lucide-react';
import { Post } from '@/types';
import { useTranslation } from '@/components/TranslationProvider';

interface RecommendationReason {
  type: 'interest' | 'trending' | 'friends' | 'recent';
  icon: React.ElementType;
  text: string;
}

interface RecommendedContent {
  post: Post;
  reason: RecommendationReason;
  score: number;
}

export function AIContentRecommender() {
  const { t } = useTranslation();
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const recommendationReasons: Record<string, RecommendationReason> = {
    interest: {
      type: 'interest',
      icon: Sparkles,
      text: t('ai.basedOnInterests'),
    },
    trending: {
      type: 'trending',
      icon: TrendingUp,
      text: t('ai.trendingInNetwork'),
    },
    friends: {
      type: 'friends',
      icon: Users,
      text: t('ai.popularWithFriends'),
    },
    recent: {
      type: 'recent',
      icon: Clock,
      text: t('ai.recentlyPublished'),
    },
  };

  const generateRecommendations = () => {
    setIsLoading(true);

    // Simulate AI recommendation generation
    setTimeout(() => {
      // No mock data - recommendations will be generated from real user interactions
      const recommended: RecommendedContent[] = [];

      setRecommendations(recommended);
      setIsLoading(false);
    }, 1500);
  };

  useEffect(() => {
    // Auto-show recommendations after page load
    const timer = setTimeout(() => {
      generateRecommendations();
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      key="ai-recommender"
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-4 top-20 z-40 w-96 max-h-[calc(100vh-100px)] overflow-hidden"
    >
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-semibold">{t('ai.aiRecommendations')}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={generateRecommendations}
                disabled={isLoading}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label={t('ai.refreshRecommendations')}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-xs mt-2 opacity-90">
            {t('ai.personalizedContent')}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce animate-delay-100"></div>
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce animate-delay-200"></div>
              </div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 mx-auto text-gray-400" />
              <p className="mt-3 text-sm text-gray-600">{t('ai.noRecommendations') || 'Aucune recommandation pour le moment.'}</p>
              <button
                onClick={generateRecommendations}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {t('ai.refreshRecommendations') || 'Actualiser'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((item, index) => {
                const ReasonIcon = item.reason.icon;

                return (
                  <div
                    key={item.post.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {/* Reason Badge */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="p-1.5 bg-green-100 rounded-full">
                        <ReasonIcon className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-xs text-green-700 font-medium">
                        {item.reason.text}
                      </span>
                      <div className="ml-auto text-xs text-gray-500">
                        {Math.round(item.score)}% {t('ai.match')}
                      </div>
                    </div>

                    {/* Post Preview */}
                    <div className="flex items-start space-x-3">
                      {item.post.author?.avatar && (
                        <img
                          src={item.post.author.avatar}
                          alt={item.post.author.username}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {item.post.author?.firstName} {item.post.author?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.post.content}
                        </p>

                        {/* Media Preview */}
                        {item.post.mediaUrls && item.post.mediaUrls.length > 0 && (
                          <div className="mt-2">
                            <img
                              src={item.post.mediaUrls[0]}
                              alt="Post media"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {/* Engagement */}
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span>❤️ {item.post._count?.likes}</span>
                          <span>💬 {item.post._count?.comments}</span>
                          <span>🔄 {item.post._count?.shares}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {t('ai.poweredByAI')} • {t('ai.learnMoreInSettings')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}