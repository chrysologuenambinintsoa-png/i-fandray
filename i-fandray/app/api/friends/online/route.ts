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

    // Get friends who are online
    const onlineFriends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          }
        },
        friend: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            isOnline: true,
            lastSeen: true,
          }
        }
      }
    });

    // Extract online friends from the results
    const friends: any[] = [];
    onlineFriends.forEach(friendship => {
      if (friendship.user && friendship.user.id !== userId && friendship.user.isOnline) {
        friends.push(friendship.user);
      }
      if (friendship.friend && friendship.friend.id !== userId && friendship.friend.isOnline) {
        friends.push(friendship.friend);
      }
    });

    // Remove duplicates and sort by name
    const uniqueFriends = friends.filter((friend, index, self) =>
      index === self.findIndex(f => f.id === friend.id)
    ).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

    return NextResponse.json({ friends: uniqueFriends });
  } catch (error) {
    console.error('Error fetching online friends:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}