import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const messageId = params.messageId;
    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get('type') ?? 'for-me'; // 'for-me' or 'for-everyone'

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

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.conversationId !== conversationId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (deleteType === 'for-everyone') {
      // Only allow sender to delete for everyone
      if (message.senderId !== session.user.id) {
        return NextResponse.json({ error: 'Only the sender can delete messages for everyone' }, { status: 403 });
      }

      // Delete the message completely
      await prisma.message.delete({ where: { id: messageId } });
    } else {
      // Delete for me only - add user to deletedFor array
      const currentDeletedFor = message.deletedFor ? JSON.parse(message.deletedFor as string) as string[] : [];
      if (!currentDeletedFor.includes(session.user.id)) {
        currentDeletedFor.push(session.user.id);
        await prisma.message.update({
          where: { id: messageId },
          data: { deletedFor: JSON.stringify(currentDeletedFor) },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
