import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = params;
    const body = await request.json();
    const { userId } = body; // The other user's ID

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const currentUserId = session.user.id;

    if (currentUserId === userId) {
      return NextResponse.json({ error: 'Cannot perform this action on yourself' }, { status: 400 });
    }

    // Get current user info
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { firstName: true, lastName: true }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'Current user not found' }, { status: 404 });
    }

    switch (action) {
      case 'accept': {
        // Find the pending friend request
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            senderId: userId,
            receiverId: currentUserId,
            status: 'pending'
          }
        });

        if (!friendRequest) {
          return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        // Update request status
        await prisma.friendRequest.update({
          where: { id: friendRequest.id },
          data: { status: 'accepted' }
        });

        // Create friendship (ensure consistent ordering)
        const [sortedUserId, sortedFriendId] = [currentUserId, userId].sort();
        await prisma.friend.create({
          data: {
            userId: sortedUserId,
            friendId: sortedFriendId
          }
        });

        // Create notification for sender
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'friend_accepted',
            content: `${currentUser.firstName} ${currentUser.lastName} a accepté votre demande d'ami`,
            recipientId: userId,
            data: JSON.stringify({ accepterId: currentUserId }),
          }),
        });

        return NextResponse.json({ message: 'Friend request accepted' });
      }

      case 'decline': {
        // Find and update the pending friend request
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            senderId: userId,
            receiverId: currentUserId,
            status: 'pending'
          }
        });

        if (!friendRequest) {
          return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        await prisma.friendRequest.update({
          where: { id: friendRequest.id },
          data: { status: 'declined' }
        });

        return NextResponse.json({ message: 'Friend request declined' });
      }

      case 'block': {
        // Check if already blocked
        const existingBlock = await prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: currentUserId,
              blockedId: userId
            }
          }
        });

        if (existingBlock) {
          return NextResponse.json({ error: 'User already blocked' }, { status: 400 });
        }

        // Remove any existing friendship
        await prisma.friend.deleteMany({
          where: {
            OR: [
              { userId: currentUserId, friendId: userId },
              { userId: userId, friendId: currentUserId }
            ]
          }
        });

        // Remove any friend requests between them
        await prisma.friendRequest.deleteMany({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: userId },
              { senderId: userId, receiverId: currentUserId }
            ]
          }
        });

        // Create block
        await prisma.block.create({
          data: {
            blockerId: currentUserId,
            blockedId: userId
          }
        });

        return NextResponse.json({ message: 'User blocked successfully' });
      }

      case 'unblock': {
        // Find and remove the block
        const block = await prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: currentUserId,
              blockedId: userId
            }
          }
        });

        if (!block) {
          return NextResponse.json({ error: 'User not blocked' }, { status: 400 });
        }

        await prisma.block.delete({
          where: { id: block.id }
        });

        return NextResponse.json({ message: 'User unblocked successfully' });
      }

      case 'cancel': {
        // Find and delete the sent friend request
        const friendRequest = await prisma.friendRequest.findFirst({
          where: {
            senderId: currentUserId,
            receiverId: userId,
            status: 'pending'
          }
        });

        if (!friendRequest) {
          return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        await prisma.friendRequest.delete({
          where: { id: friendRequest.id }
        });

        return NextResponse.json({ message: 'Friend request cancelled' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error performing friend action ${params.action}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}