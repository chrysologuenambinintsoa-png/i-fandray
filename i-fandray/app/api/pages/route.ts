import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const discover = searchParams.get('discover') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const where: any = {};

    if (userId) {
      where.creatorId = userId;
    } else if (!discover) {
      // If no userId specified and not in discover mode, return user's own pages
      where.creatorId = session.user.id;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const pages = await prisma.page.findMany({
      where,
      include: {
        owner: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        },
        _count: {
          select: { followers: true, posts: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json(pages);
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

    const { name, description, category, website, avatar, coverPhoto } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Page name is required' }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        name,
        description,
        category,
        website,
        avatar,
        coverPhoto,
        ownerId: session.user.id
      },
      include: {
        owner: {
          select: { id: true, username: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
