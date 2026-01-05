'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, Globe, Clock, ChevronRight, Bookmark, Share2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useTranslation } from '@/components/TranslationProvider';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  source: string;
  category: string;
  url?: string;
  publishedAt: Date;
  isTrending?: boolean;
  isBookmarked?: boolean;
  author?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export function NewsAggregator() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const categories = [
    { id: 'all', name: t('news.all'), icon: Globe },
    { id: 'technology', name: t('news.technology'), icon: Globe },
    { id: 'business', name: t('news.business'), icon: TrendingUp },
    { id: 'sports', name: t('news.sports'), icon: Newspaper },
    { id: 'entertainment', name: t('news.entertainment'), icon: Globe },
    { id: 'science', name: t('news.science'), icon: Globe },
  ];

  const fetchNews = useCallback(async (category: string, resetOffset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = resetOffset ? 0 : offset;
      const url = `/api/news?category=${category}&limit=20&offset=${currentOffset}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      
      const mappedArticles: NewsArticle[] = data.news.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.summary || item.content.substring(0, 150) + '...',
        content: item.content,
        imageUrl: item.imageUrl,
        source: item.source || item.author?.username || 'Unknown Source',
        category: item.category,
        url: item.url,
        publishedAt: new Date(item.publishedAt),
        isTrending: item.isTrending || false,
        isBookmarked: false, // Would need user preferences
        author: item.author,
      }));
      
      if (resetOffset) {
        setArticles(mappedArticles);
        setOffset(20);
      } else {
        setArticles(prev => [...prev, ...mappedArticles]);
        setOffset(prev => prev + 20);
      }
      
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    fetchNews(selectedCategory, true);
  }, [selectedCategory, fetchNews]);

  const handleBookmark = (articleId: string) => {
    setArticles(articles.map(article =>
      article.id === articleId
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));
  };

  const handleShare = (articleId: string) => {
    // Implement share functionality
    console.log('Share article:', articleId);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNews(selectedCategory, false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-white">
            <Newspaper className="w-6 h-6" />
            <h2 className="text-xl font-bold">{t('news.newsFeed')}</h2>
          </div>
          <button 
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            aria-label={t('news.shareNewsFeed')}
            title="Share news feed"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white text-purple-600 font-medium'
                    : 'text-white hover:bg-white hover:bg-opacity-20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-2">Error loading news</div>
              <div className="text-gray-600">{error}</div>
              <button 
                onClick={() => fetchNews(selectedCategory, true)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : loading && articles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 bg-blue-600 rounded-full animate-bounce`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-gray-500 text-lg mb-2">{t('news.noArticles') || 'Aucun article trouvé'}</div>
              <div className="text-gray-400">{t('news.tryOtherCategory') || "Essayez une autre catégorie ou actualisez pour charger les dernières actualités."}</div>
              <div className="mt-4 flex items-center justify-center space-x-2">
                <button
                  onClick={() => fetchNews(selectedCategory, true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t('news.refresh') || 'Actualiser'}
                </button>
                <button
                  onClick={() => fetchNews('all', true)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('news.syncAll') || 'Synchroniser tout'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Article Header */}
                <div className="relative">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/800x400?text=News';
                      }}
                    />
                  )}
                  
                  {/* Trending Badge */}
                  {article.isTrending && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{t('news.trending')}</span>
                    </div>
                  )}

                  {/* Bookmark Button */}
                  <button
                    onClick={() => handleBookmark(article.id)}
                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-opacity"
                    aria-label={article.isBookmarked ? t('news.removeBookmark') : t('news.addBookmark')}
                    title={article.isBookmarked ? t('news.removeBookmark') : t('news.addBookmark')}
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        article.isBookmarked ? 'fill-purple-600 text-purple-600' : 'text-gray-600'
                      }`}
                    />
                  </button>
                </div>

                {/* Article Content */}
                <div className="p-4">
                  {/* Source and Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-purple-600">{article.source}</span>
                      <span>•</span>
                      <span>{article.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-purple-600 cursor-pointer">
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {article.summary}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1">
                      <span>{t('news.readMore')}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleShare(article.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Share article"
                      title="Share article"
                    >
                      <Share2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
            
            {/* Loading more indicator */}
            {loading && articles.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 bg-blue-600 rounded-full animate-bounce`}
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && articles.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={loadMore}
            className="w-full py-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors"
          >
            Load More News
          </button>
        </div>
      )}
    </div>
  );
}