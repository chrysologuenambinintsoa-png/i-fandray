import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? 'all';
    const limit = parseInt(searchParams.get('limit') ?? '20');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const where = category === 'all' ? {} : { category };

    const videos = await prisma.video.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            videoLikes: true,
            videoComments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.video.count({ where });

    // Transform the data to match the expected format
    const transformedVideos = videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views,
      likes: video._count.videoLikes,
      comments: video._count.videoComments,
      category: video.category,
      isLive: video.isLive,
      isTrending: video.isTrending,
      createdAt: video.createdAt,
      author: video.author,
    }));

    return NextResponse.json({
      videos: transformedVideos,
      total,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    
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
    const { title, description, videoUrl, thumbnailUrl, duration, category } = body;

    // Validate required fields
    if (!title || !description || !videoUrl || !thumbnailUrl || !duration || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the video in the database
    const video = await prisma.video.create({
      data: {
        title,
        description,
        videoUrl,
        thumbnailUrl,
        duration: parseInt(duration),
        category,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            videoLikes: true,
            videoComments: true,
          },
        },
      },
    });

    // Transform the response to match the expected format
    const transformedVideo = {
      id: video.id,
      title: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      duration: video.duration,
      views: video.views,
      likes: video._count.videoLikes,
      comments: video._count.videoComments,
      category: video.category,
      isLive: video.isLive,
      isTrending: video.isTrending,
      createdAt: video.createdAt,
      author: video.author,
    };

    return NextResponse.json(transformedVideo, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
