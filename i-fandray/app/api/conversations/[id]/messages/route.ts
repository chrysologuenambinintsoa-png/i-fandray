import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
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
    });

    // Filter out messages deleted for this user and parse attachments
    const filteredMessages = messages
      .filter(message => {
        if (!message.deletedFor) return true;
        try {
          const deletedFor = JSON.parse(message.deletedFor as string) as string[];
          return !deletedFor.includes(session.user.id);
        } catch (error) {
          console.error('Error parsing deletedFor:', error);
          return true; // If parsing fails, show the message
        }
      })
      .map(message => ({
        ...message,
        attachments: message.attachments ? JSON.parse(message.attachments as string) : null,
        deletedFor: message.deletedFor ? JSON.parse(message.deletedFor as string) : null,
        // Include encryption data if message is encrypted
        encryptedData: message.isEncrypted ? message.encryptedData : null,
        encryptionKeyId: message.isEncrypted ? message.encryptionKeyId : null,
      }));

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Update last read timestamp
    await prisma.conversationParticipant.update({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
      data: { lastReadAt: new Date() },
    });

    const total = await prisma.message.count({
      where: { conversationId },
    });

    return NextResponse.json({
      messages: filteredMessages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
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

    const conversationId = params.id;
    const body = await request.json();
    const { content, attachments, isEncrypted, encryptedData, encryptionKeyId } = body;

    if (!content && !encryptedData && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Content, encrypted data, or attachments are required' }, { status: 400 });
    }

    // Check if user is participant in conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: session.user.id,
          conversationId,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get other participants for receiverId (assuming private conversation)
    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: session.user.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });

    if (otherParticipants.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
    }

    // For now, send to the first other participant (private conversation)
    const receiverId = otherParticipants[0].userId;

    // Create message with encryption support
    const message = await prisma.message.create({
      data: {
        content: isEncrypted ? null : content, // Clear text content if encrypted
        encryptedData: isEncrypted ? encryptedData : null, // Encrypted data if encrypted
        isEncrypted: isEncrypted || false,
        encryptionKeyId: isEncrypted ? encryptionKeyId : null,
        attachments: attachments ? JSON.stringify(attachments) : undefined,
        senderId: session.user.id,
        receiverId,
        conversationId,
      },
      include: {
        sender: {
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
    });

    // Create notifications for other participants
    for (const participant of otherParticipants) {
      await prisma.notification.create({
        data: {
          type: 'message',
          content: `${session.user.name} sent you a message`,
          userId: participant.userId,
          data: JSON.stringify({ conversationId, messageId: message.id }),
        },
      });
    }

    return NextResponse.json({
      ...message,
      attachments: message.attachments ? JSON.parse(message.attachments as string) : null,
      deletedFor: message.deletedFor ? JSON.parse(message.deletedFor as string) : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}