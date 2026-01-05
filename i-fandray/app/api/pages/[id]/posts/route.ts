import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const posts = await prisma.post.findMany({
      where: { page: { id: params.id } },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        },
        page: {
          select: { id: true, name: true, avatar: true }
        },
        _count: {
          select: { likes: true, comments: true, shares: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching page posts:', error);
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

    const page = await prisma.page.findUnique({
      where: { id: params.id },
      include: { admins: true }
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const isAdmin = page.ownerId === session.user.id ||
      page.admins.some(admin => admin.userId === session.user.id);

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { content, mediaUrls, mediaType, visibility, location, feeling, tags } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        content,
        mediaUrls: mediaUrls || [],
        mediaType: mediaType || 'text',
        visibility: visibility || 'public',
        location,
        feeling,
        tags,
        author: { connect: { id: session.user.id } },
        page: { connect: { id: params.id } }
      },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        },
        page: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating page post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}