import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { content } = body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Create share
    const share = await prisma.share.create({
      data: {
        content,
        userId: session.user.id,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
      },
    });

    // Create notification
    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'share',
          content: `${session.user.name} shared your post`,
          userId: post.authorId,
          data: JSON.stringify({ postId, shareId: share.id }),
        },
      });
    }

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Error sharing post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}