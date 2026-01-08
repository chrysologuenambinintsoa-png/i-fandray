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

    // Get suggested pages (created by other users, not followed by current user)
    const suggestedPages = await prisma.page.findMany({
      where: {
        ownerId: {
          not: userId
        },
        followers: {
          none: {
            userId: userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        category: true,
        owner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get suggested groups (created by other users, not joined by current user)
    const suggestedGroups = await prisma.group.findMany({
      where: {
        ownerId: {
          not: userId
        },
        members: {
          none: {
            userId: userId
          }
        },
        privacy: 'public'
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        category: true,
        memberCount: true,
        privacy: true,
        owner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      take: 10,
      orderBy: {
        memberCount: 'desc'
      }
    });

    return NextResponse.json({
      pages: suggestedPages,
      groups: suggestedGroups
    });

  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
