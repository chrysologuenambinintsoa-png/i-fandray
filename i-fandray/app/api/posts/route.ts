import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true, emoji: true },
        },
      },
    });

    // Transform posts to include parsed media
    const transformedPosts = posts.map(post => ({
      ...post,
      mediaUrls: post.mediaUrls || [],
      media: post.mediaUrls ? post.mediaUrls.map((url: string, index: number) => ({
        url,
        alt: `Media ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image'
      })) : [],
      tags: post.tags || [],
    }));

    // TODO: Fetch sponsored content for feed (model not in schema)
    // const now = new Date();
    // const sponsoredContents = await prisma.sponsoredContent.findMany({
    //   where: {
    //     placement: 'feed',
    //     isActive: true,
    //     campaignStart: { lte: now },
    //     campaignEnd: { gte: now },
    //   },
    //   orderBy: { createdAt: 'desc' },
    // });

    // // Interleave sponsored content every 5 posts
    // const interleavedPosts: any[] = [];
    // let sponsoredIndex = 0;
    // for (let i = 0; i < transformedPosts.length; i++) {
    //   interleavedPosts.push(transformedPosts[i]);
    //   if ((i + 1) % 5 === 0 && sponsoredIndex < sponsoredContents.length) {
    //     interleavedPosts.push({
    //       ...sponsoredContents[sponsoredIndex],
    //       isSponsored: true,
    //       type: 'sponsored',
    //     });
    //     sponsoredIndex++;
    //   }
    // }

    // // Add remaining sponsored if any
    // while (sponsoredIndex < sponsoredContents.length) {
    //   interleavedPosts.push({
    //     ...sponsoredContents[sponsoredIndex],
    //     isSponsored: true,
    //     type: 'sponsored',
    //   });
    //   sponsoredIndex++;
    // }

    const total = await prisma.post.count();

    return NextResponse.json({
      posts: transformedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, mediaUrls, mediaType, visibility, location, feeling, tags } = body;

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json({ error: 'Content or media is required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls: mediaUrls || [],
        mediaType: mediaType || 'text',
        visibility: visibility || 'public',
        location,
        feeling,
        tags: tags || [],
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });

    // Transform the created post to include parsed media
    const transformedPost = {
      ...post,
      mediaUrls: post.mediaUrls || [],
      media: post.mediaUrls ? post.mediaUrls.map((url: string, index: number) => ({
        url,
        alt: `Media ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image'
      })) : [],
      tags: post.tags || [],
    };

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}