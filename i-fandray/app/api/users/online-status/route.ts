 import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOnlineStatusUpdateToFriends } from '@/lib/sse-utils';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isOnline } = body;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'isOnline must be a boolean' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isOnline,
        lastSeen: isOnline ? null : new Date(),
      },
      select: {
        id: true,
        isOnline: true,
        lastSeen: true,
      },
    });

    // Notify friends about online status change
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { friendId: session.user.id }
        ]
      },
      select: {
        userId: true,
        friendId: true,
      }
    });

    const friendIds = friends.flatMap(f => [f.userId, f.friendId]).filter(id => id !== session.user.id);
    sendOnlineStatusUpdateToFriends(session.user.id, isOnline, friendIds);

    return NextResponse.json(user);
  } catch (error) {
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
