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

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
                isVerified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        messages: {
          _count: 'desc',
        },
      },
    });

    // Format conversations for frontend
    const formattedConversations = conversations.map((conv: any) => {
      const otherParticipants = conv.participants.filter(
        (p: any) => p.userId !== session.user.id
      );

      return {
        id: conv.id,
        type: conv.type,
        name: conv.name || otherParticipants.map((p: any) => `${p.user.firstName} ${p.user.lastName}`).join(', '),
        avatar: conv.avatar || otherParticipants[0]?.user.avatar,
        lastMessage: conv.messages[0],
        unreadCount: conv.messages.filter((m: any) =>
          m.senderId !== session.user.id && !m.isRead
        ).length,
        participants: conv.participants,
      };
    });

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { participantIds, type = 'private', name, isGroup = false } = body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: 'Participant IDs are required' }, { status: 400 });
    }

    // For private conversations, check if one already exists
    if (type === 'private' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'private',
          participants: {
            every: {
              userId: {
                in: [session.user.id, ...participantIds],
              },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingConversation && existingConversation.participants.length === 2) {
        return NextResponse.json(existingConversation);
      }
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: isGroup ? 'group' : type,
        name: isGroup ? name : null,
        participants: {
          create: [
            { userId: session.user.id },
            ...participantIds.map((userId: string) => ({ userId })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
