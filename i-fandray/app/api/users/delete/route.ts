import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Start a transaction to delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Get all post IDs by this user first
      const userPosts = await tx.post.findMany({
        where: { authorId: userId },
        select: { id: true }
      });
      const postIds = userPosts.map(p => p.id);

      // Delete likes, shares, and comments on user's posts
      if (postIds.length > 0) {
        await tx.like.deleteMany({ where: { postId: { in: postIds } } });
        await tx.share.deleteMany({ where: { postId: { in: postIds } } });
        await tx.comment.deleteMany({ where: { postId: { in: postIds } } });
      }

      // Delete user's posts
      await tx.post.deleteMany({ where: { authorId: userId } });

      // Delete user's direct comments, likes, shares
      await tx.comment.deleteMany({ where: { authorId: userId } });
      await tx.like.deleteMany({ where: { userId: userId } });
      await tx.share.deleteMany({ where: { userId: userId } });

      // Delete user's friendships
      await tx.friend.deleteMany({
        where: {
          OR: [
            { userId: userId },
            { friendId: userId }
          ]
        }
      });

      // Delete user's friend requests
      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      });

      // Delete user's messages and conversation participations
      await tx.message.deleteMany({ where: { senderId: userId } });
      await tx.conversationParticipant.deleteMany({ where: { userId } });

      // Delete conversations where user was the only participant
      const userConversations = await tx.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true }
      });
      const conversationIds = [...new Set(userConversations.map(cp => cp.conversationId))];

      for (const convId of conversationIds) {
        const participantCount = await tx.conversationParticipant.count({
          where: { conversationId: convId }
        });
        if (participantCount === 0) {
          await tx.conversation.delete({ where: { id: convId } }).catch(() => {});
        }
      }

      // Delete user's notifications
      await tx.notification.deleteMany({ where: { userId: userId } });

      // Delete user's stories
      await tx.story.deleteMany({ where: { authorId: userId } });

      // Delete user's blocks
      await tx.block.deleteMany({
        where: {
          OR: [
            { blockerId: userId },
            { blockedId: userId }
          ]
        }
      });

      // Delete user's group memberships
      await tx.groupMember.deleteMany({ where: { userId: userId } });

      // Delete user's page follows and admin roles
      await tx.pageFollower.deleteMany({ where: { userId: userId } });
      await tx.pageAdmin.deleteMany({ where: { userId: userId } });

      // Finally, delete the user
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}