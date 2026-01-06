import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get followed pages
    const followedPages = await prisma.pageFollower.findMany({
      where: {
        userId: userId
      },
      select: {
        page: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Get joined groups
    const joinedGroups = await prisma.groupMember.findMany({
      where: {
        userId: userId
      },
      select: {
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      pages: followedPages.map(fp => fp.page),
      groups: joinedGroups.map(jg => jg.group)
    });

  } catch (error) {
    console.error('User following API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}