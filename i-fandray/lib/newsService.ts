import { prisma } from '@/lib/prisma';

interface NewsAPISource {
  id: string | null;
  name: string;
}

interface NewsAPIArticle {
  source: NewsAPISource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

class NewsService {
  private apiKey: string;
  private baseUrl = 'https://newsapi.org/v2';

  constructor() {
    this.apiKey = process.env.NEWS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('NEWS_API_KEY not found. News fetching will be disabled.');
    }
  }

  async fetchTopHeadlines(category?: string, country = 'us'): Promise<NewsAPIArticle[]> {
    if (!this.apiKey) return [];

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        country,
        pageSize: '20',
      });

      if (category && category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/top-headlines?${params}`);
      const data: NewsAPIResponse = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${data.status}`);
      }

      return data.articles;
    } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      return [];
    }
  }

  async fetchEverything(query: string, language = 'en'): Promise<NewsAPIArticle[]> {
    if (!this.apiKey) return [];

    try {
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        q: query,
        language,
        sortBy: 'publishedAt',
        pageSize: '20',
      });

      const response = await fetch(`${this.baseUrl}/everything?${params}`);
      const data: NewsAPIResponse = await response.json();

      if (data.status !== 'ok') {
        throw new Error(`NewsAPI error: ${data.status}`);
      }

      return data.articles;
    } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      return [];
    }
  }

  async syncNewsToDatabase(category?: string): Promise<void> {
    try {
      console.log('Starting news synchronization...');

      // Get a system user for news articles
      let systemUser = await prisma.user.findFirst({
        where: { username: 'news_system' }
      });

      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            firstName: 'News',
            lastName: 'System',
            username: 'news_system',
            email: 'news@system.local',
            password: 'system_password', // This will be hashed by the auth system
            isVerified: true,
          }
        });
      }

      const articles = await this.fetchTopHeadlines(category);

      let syncedCount = 0;

      for (const article of articles) {
        // Check if article already exists
        const existingArticle = await prisma.news.findFirst({
          where: {
            url: article.url,
          }
        });

        if (!existingArticle) {
          // Map NewsAPI categories to our categories
          const categoryMap: { [key: string]: string } = {
            'business': 'business',
            'entertainment': 'entertainment',
            'general': 'general',
            'health': 'science',
            'science': 'science',
            'sports': 'sports',
            'technology': 'technology'
          };

          const mappedCategory = categoryMap[category || 'general'] || 'general';

          await prisma.news.create({
            data: {
              title: article.title,
              content: article.content || article.description || article.title,
              summary: article.description,
              imageUrl: article.urlToImage,
              source: article.source.name,
              category: mappedCategory,
              url: article.url,
              publishedAt: new Date(article.publishedAt),
              authorId: systemUser.id,
            }
          });

          syncedCount++;
        }
      }

      console.log(`News synchronization completed. ${syncedCount} new articles added.`);

      // Clean up old news (keep only last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedCount = await prisma.news.deleteMany({
        where: {
          publishedAt: {
            lt: thirtyDaysAgo
          },
          authorId: systemUser.id, // Only delete system-generated news
        }
      });

      if (deletedCount.count > 0) {
        console.log(`Cleaned up ${deletedCount.count} old news articles.`);
      }

    } catch (error) {
      console.error('Error syncing news to database:', error);
    }
  }

  async getTrendingNews(limit = 10): Promise<any[]> {
    try {
      // For trending, we'll use a simple heuristic: recent articles with high engagement potential
      const recentNews = await prisma.news.findMany({
        where: {
          publishedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          author: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            }
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });

      // Mark some as trending based on recency and category popularity
      return recentNews.map((article, index) => ({
        ...article,
        isTrending: index < 3, // First 3 articles are trending
      }));

    } catch (error) {
      console.error('Error getting trending news:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();