import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        users: [],
        posts: [],
        hashtags: []
      });
    }

    const searchTerm = query.trim().toLowerCase();

    // Search users
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                firstName: {
                  contains: searchTerm
                }
              },
              {
                lastName: {
                  contains: searchTerm
                }
              },
              {
                username: {
                  contains: searchTerm
                }
              }
            ]
          },
          {
            id: {
              not: session.user.id // Exclude current user
            }
          }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      },
      take: 20,
      orderBy: {
        firstName: 'asc'
      }
    });

    // Search posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            content: {
              contains: searchTerm
            }
          },
          {
            author: {
              OR: [
                {
                  firstName: {
                    contains: searchTerm
                  }
                },
                {
                  lastName: {
                    contains: searchTerm
                  }
                },
                {
                  username: {
                    contains: searchTerm
                  }
                }
              ]
            }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      },
      take: 50,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform posts to match expected format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      media: [], // Posts don't have media in this schema
      _count: post._count
    }));

    // Extract hashtags from posts content
    const hashtagRegex = /#(\w+)/g;
    const hashtags = new Set<string>();

    posts.forEach(post => {
      const matches = post.content.match(hashtagRegex);
      if (matches) {
        matches.forEach(match => {
          const hashtag = match.slice(1).toLowerCase(); // Remove # and lowercase
          if (hashtag.includes(searchTerm) || searchTerm.includes(hashtag)) {
            hashtags.add(match.slice(1)); // Keep original case
          }
        });
      }
    });

    // Convert Set to Array and sort
    const hashtagsArray = Array.from(hashtags).sort();

    return NextResponse.json({
      users,
      posts: transformedPosts,
      hashtags: hashtagsArray
    });

  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
