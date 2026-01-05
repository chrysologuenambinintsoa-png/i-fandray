import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is member (for private groups)
    if (group.privacy === 'private') {
      const member = await prisma.groupMember.findFirst({
        where: {
          userId: session.user.id,
          groupId: params.id,
        },
      });
      if (!member) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { groupId: params.id },
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
      },
    });

    const total = await prisma.post.count({
      where: { groupId: params.id },
    });

    // Transform posts to match Post interface
    const transformedPosts = posts.map(post => ({
      ...post,
      mediaUrls: post.mediaUrls || [],
      media: post.mediaUrls ? post.mediaUrls.map((url: string, index: number) => ({
        url,
        alt: `Media ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image'
      })) : [],
      visibility: 'public' as const,
      location: undefined,
      feeling: undefined,
      tags: [],
      _count: { likes: 0, comments: 0, shares: 0 },
      likes: [],
      comments: [],
      shares: [],
    }));

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
    console.error('Error fetching group posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is member
    const member = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId: params.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Must be a member to post' }, { status: 403 });
    }

    const body = await request.json();
    const { content, mediaUrls, mediaType, postToFeed } = body;

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      return NextResponse.json({ error: 'Content or media is required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls: mediaUrls || [],
        mediaType: mediaType || 'text',
        visibility: 'public',
        groupId: params.id,
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
      },
    });

    // If postToFeed is true, also create a regular post
    let feedPost = null;
    if (postToFeed) {
      feedPost = await prisma.post.create({
        data: {
          content: `${content}\n\n[Posted in ${group.name}]`,
          mediaUrls: mediaUrls || [],
          mediaType: mediaType || 'text',
          visibility: 'public',
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
        },
      });
    }

    // Transform the created post
    const transformedPost = {
      ...post,
      mediaUrls: post.mediaUrls || [],
      media: post.mediaUrls ? post.mediaUrls.map((url: string, index: number) => ({
        url,
        alt: `Media ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') ? 'video' : 'image'
      })) : [],
      tags: [],
      _count: { likes: 0, comments: 0, shares: 0 },
      likes: [],
      comments: [],
      shares: [],
    };

    return NextResponse.json({ 
      post: transformedPost,
      feedPost,
      message: postToFeed ? 'Post created in group and shared to feed' : 'Post created in group'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating group post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}