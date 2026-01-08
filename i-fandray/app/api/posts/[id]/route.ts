import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('[POST DELETE] Starting delete for post:', params.id);
    let session = await getServerSession(authOptions);
    console.debug('[post:id] DELETE called', { id: params.id, method: request.method, initialSession: !!session?.user?.id });

    // Fallbacks: try getToken then prisma session lookup if needed
    if (!session?.user?.id) {
      try {
        const { getToken } = await import('next-auth/jwt');
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
          // @ts-ignore
          session = { user: { id: token.id || token.sub } } as any;
          console.log('[POST DELETE] Session recovered from JWT token');
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
              console.log('[POST DELETE] Session recovered from cookie');
            }
          }
        } catch (dbErr) {
          console.debug('[post:id] prisma session lookup failed:', dbErr);
        }
      }
    }

    const cookiePresent = Boolean(request.cookies.get('next-auth.session-token')?.value);
    console.debug('[post:id] session state after fallbacks', { sessionUserId: session?.user?.id, cookiePresent });

    if (!session?.user?.id) {
      console.log('[POST DELETE] Unauthorized - no session user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const postId = params.id;

    // Verify ownership
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      console.log('[POST DELETE] Post not found:', postId);
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    console.log('[POST DELETE] Post found. Checking ownership.', { 
      postAuthorId: post.authorId, 
      sessionUserId: session.user.id, 
      isOwner: post.authorId === session.user.id 
    });
    
    if (post.authorId !== session.user.id) {
      console.log('[POST DELETE] Forbidden - user does not own this post');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete post (cascade depends on prisma schema). Attempt to remove related records first for safety.
    console.log('[POST DELETE] Deleting comments...');
    await prisma.comment.deleteMany({ where: { postId } });
    
    console.log('[POST DELETE] Deleting likes...');
    await prisma.like.deleteMany({ where: { postId } });
    
    console.log('[POST DELETE] Deleting shares...');
    await prisma.share.deleteMany({ where: { postId } });

    console.log('[POST DELETE] Deleting post...');
    await prisma.post.delete({ where: { id: postId } });

    console.log('[POST DELETE] Post deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST DELETE] Error deleting post:', error);
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

    const cookiePresentPut = Boolean(request.cookies.get('next-auth.session-token')?.value);
    console.debug('[post:id] PUT session state after fallbacks', { sessionUserId: session?.user?.id, cookiePresent: cookiePresentPut });

    if (!session?.user?.id) {
      console.debug('[post:id] Unauthorized access attempt (PUT)', { id: params.id, cookiePresent: cookiePresentPut });
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
