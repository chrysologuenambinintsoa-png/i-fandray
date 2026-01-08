import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getServerSession(authOptions);

    // Fallbacks: token then prisma session lookup
    if (!session?.user?.id) {
      try {
        const { getToken } = await import('next-auth/jwt');
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
          // @ts-ignore
          session = { user: { id: token.id || token.sub } } as any;
        }
      } catch (tokErr) {
        console.debug('[likes] getToken fallback failed:', tokErr);
      }

      if (!session?.user?.id) {
        try {
          const cookieVal = request.cookies.get('next-auth.session-token')?.value;
          if (cookieVal) {
            const sessionRecord = await prisma.session.findUnique({ where: { sessionToken: cookieVal } });
            if (sessionRecord?.userId) {
              session = { user: { id: sessionRecord.userId } } as any;
            }
          }
        } catch (dbErr) {
          console.debug('[likes] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json().catch(() => ({}));
    const { emoji } = body;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    if (emoji) {
      // For emoji reactions
      if (existingLike && existingLike.emoji === emoji) {
        // Same emoji, remove the like
        await prisma.like.deleteMany({
          where: {
            userId: session.user.id,
            postId,
            emoji,
          },
        });
        return NextResponse.json({ message: 'Reaction removed' });
      } else {
        // Different or no emoji, upsert
        // First remove any existing like
        await prisma.like.deleteMany({
          where: {
            userId: session.user.id,
            postId,
          },
        });
        // Then create new one
        const like = await prisma.like.create({
          data: {
            userId: session.user.id,
            postId,
            emoji,
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
          },
        });
        return NextResponse.json(like, { status: 201 });
      }
    } else {
      // For simple like toggle
      if (existingLike) {
        // Unlike
        await prisma.like.deleteMany({
          where: {
            userId: session.user.id,
            postId,
          },
        });
        return NextResponse.json({ message: 'Like removed' });
      } else {
        // Like
        const like = await prisma.like.create({
          data: {
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
          },
        });

        // Create notification for post author (if not self-like)
        if (post.authorId !== session.user.id) {
          await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'like_post',
              content: `${like.user.firstName} ${like.user.lastName} a aimé votre publication`,
              recipientId: post.authorId,
            }),
          });
        }

        return NextResponse.json(like, { status: 201 });
      }
    }
  } catch (error) {
    console.error('Error handling like:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let session = await getServerSession(authOptions);

    // Fallbacks: token then prisma session lookup
    if (!session?.user?.id) {
      try {
        const { getToken } = await import('next-auth/jwt');
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
          // @ts-ignore
          session = { user: { id: token.id || token.sub } } as any;
        }
      } catch (tokErr) {
        console.debug('[likes] getToken fallback failed:', tokErr);
      }

      if (!session?.user?.id) {
        try {
          const cookieVal = request.cookies.get('next-auth.session-token')?.value;
          if (cookieVal) {
            const sessionRecord = await prisma.session.findUnique({ where: { sessionToken: cookieVal } });
            if (sessionRecord?.userId) {
              session = { user: { id: sessionRecord.userId } } as any;
            }
          }
        } catch (dbErr) {
          console.debug('[likes] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Delete like
    const like = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    if (!like) {
      return NextResponse.json({ error: 'Like not found' }, { status: 404 });
    }

    await prisma.like.deleteMany({
      where: {
        userId: session.user.id,
        postId,
      },
    });

    return NextResponse.json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}