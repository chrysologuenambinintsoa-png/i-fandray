import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'friends'; // 'friends', 'requests', 'sent'

    const userId = session.user.id;

    if (type === 'friends') {
      // Get accepted friends
      const friends = await prisma.friend.findMany({
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
              isActive: true
            }
          },
          friend: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
              isActive: true
            }
          }
        }
      });

      const friendList = friends.map(friend => {
        const otherUser = friend.userId === userId ? friend.friend : friend.user;
        return {
          id: friend.id,
          friendId: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          username: otherUser.username,
          avatar: otherUser.avatar,
          isActive: otherUser.isActive,
          friendshipDate: friend.createdAt
        };
      });

      return NextResponse.json({ friends: friendList });
    }

    if (type === 'requests') {
      // Get received friend requests
      const requests = await prisma.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'pending'
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
              bio: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ requests });
    }

    if (type === 'sent') {
      // Get sent friend requests
      const sentRequests = await prisma.friendRequest.findMany({
        where: {
          senderId: userId,
          status: 'pending'
        },
        include: {
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ sentRequests });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching friends:', error);
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
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: 'Friend ID is required' }, { status: 400 });
    }

    const userId = session.user.id;

    if (userId === friendId) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Check if users exist
    const [currentUser, targetUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.user.findUnique({ where: { id: friendId } })
    ]);

    if (!currentUser || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already friends
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId }
        ]
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json({ error: 'Friend request already exists' }, { status: 400 });
      }
      if (existingRequest.status === 'accepted') {
        return NextResponse.json({ error: 'Already friends' }, { status: 400 });
      }
    }

    // Check if blocked
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: userId, blockedId: friendId },
          { blockerId: friendId, blockedId: userId }
        ]
      }
    });

    if (block) {
      return NextResponse.json({ error: 'Cannot send friend request to blocked user' }, { status: 400 });
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: friendId
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    });

    // Create notification for receiver
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'friend_request',
        content: `${currentUser.firstName} ${currentUser.lastName} vous a envoyé une demande d'ami`,
        recipientId: friendId,
        data: JSON.stringify({ requestId: friendRequest.id, senderId: userId }),
      }),
    });

    return NextResponse.json({
      message: 'Friend request sent successfully',
      request: friendRequest
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}