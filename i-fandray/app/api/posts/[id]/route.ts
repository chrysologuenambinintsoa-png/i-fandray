import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let session = await getServerSession(authOptions);

    // Fallbacks: try getToken then prisma session lookup if needed
    if (!session?.user?.id) {
      try {
        const { getToken } = await import('next-auth/jwt');
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
          // @ts-ignore
          session = { user: { id: token.id || token.sub } } as any;
        }
      } catch (tokErr) {
        console.debug('[post:id] getToken fallback failed:', tokErr);
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
          console.debug('[post:id] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete post (cascade depends on prisma schema). Attempt to remove related records first for safety.
    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.like.deleteMany({ where: { postId } });
    await prisma.share.deleteMany({ where: { postId } });

    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
        console.debug('[post] getToken fallback failed:', tokErr);
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
          console.debug('[post] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;
    const body = await request.json();

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    if (post.authorId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const updated = await prisma.post.update({ where: { id: postId }, data: body });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
