import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check if user already liked the video
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Video already liked' }, { status: 400 });
    }

    // Create the like
    await prisma.videoLike.create({
      data: {
        userId: session.user.id,
        videoId,
      },
    });

    // Update video likes count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Video liked successfully' });
  } catch (error) {
    console.error('Error liking video:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Check if like exists
    const existingLike = await prisma.videoLike.findUnique({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
    });

    if (!existingLike) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    // Delete the like
    await prisma.videoLike.delete({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
    });

    // Update video likes count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        likes: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Video unliked successfully' });
  } catch (error) {
    console.error('Error unliking video:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}