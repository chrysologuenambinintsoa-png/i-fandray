import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
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

    const pageId = params.id;
    const userId = session.user.id;

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.pageFollower.findFirst({
      where: {
        userId,
        pageId,
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this page' }, { status: 400 });
    }

    // Create follow relationship
    await prisma.pageFollower.create({
      data: {
        userId,
        pageId,
      },
    });

    return NextResponse.json({ message: 'Successfully followed page' });
  } catch (error) {
    console.error('Error following page:', error);
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

    const pageId = params.id;
    const userId = session.user.id;

    // Delete follow relationship
    await prisma.pageFollower.deleteMany({
      where: {
        userId,
        pageId,
      },
    });

    return NextResponse.json({ message: 'Successfully unfollowed page' });
  } catch (error) {
    console.error('Error unfollowing page:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}