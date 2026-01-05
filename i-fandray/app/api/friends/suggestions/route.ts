import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get current friends
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      select: {
        userId: true,
        friendId: true
      }
    });

    const friendIds = friends.flatMap(f => [f.userId, f.friendId]).filter(id => id !== userId);

    // Get blocked users
    const blocked = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: userId },
          { blockedId: userId }
        ]
      },
      select: {
        blockerId: true,
        blockedId: true
      }
    });

    const blockedIds = blocked.flatMap(b => [b.blockerId, b.blockedId]).filter(id => id !== userId);

    // Get pending requests (both sent and received)
    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: 'pending'
      },
      select: {
        senderId: true,
        receiverId: true
      }
    });

    const pendingIds = pendingRequests.flatMap(r => [r.senderId, r.receiverId]).filter(id => id !== userId);

    // Exclude current user, friends, blocked users, and users with pending requests
    const excludeIds = [userId, ...friendIds, ...blockedIds, ...pendingIds];

    // Get friend suggestions (users not in exclude list)
    // For now, get random users. In a real app, you'd use mutual friends, interests, etc.
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: excludeIds
        },
        isActive: true
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatar: true,
        bio: true
      },
      take: 20, // Limit to 20 suggestions
      orderBy: {
        createdAt: 'desc' // Show newer users first
      }
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}