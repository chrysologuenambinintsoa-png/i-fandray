import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        messages: {
          where: {
            senderId: {
              not: session.user.id,
            },
            isRead: false,
          },
        },
      },
    });

    // Calculate total unread messages
    const totalUnread = conversations.reduce((total, conv) => {
      return total + conv.messages.length;
    }, 0);

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}