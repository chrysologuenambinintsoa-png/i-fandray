import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, // Only top-level comments
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
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
        replies: {
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
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    const total = await prisma.comment.count({
      where: { postId, parentId: null },
    });

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
        console.debug('[comments] getToken fallback failed:', tokErr);
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
          console.debug('[comments] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // If it's a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 404 });
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
        parentId,
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

    // Create notification
    if (post.authorId !== session.user.id) {
      await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: parentId ? 'reply_comment' : 'comment',
          content: `${comment.author.firstName} ${comment.author.lastName} ${parentId ? 'a répondu à votre commentaire' : 'a commenté votre publication'}`,
          recipientId: post.authorId,
          data: JSON.stringify({ postId, commentId: comment.id }),
        }),
      });
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}