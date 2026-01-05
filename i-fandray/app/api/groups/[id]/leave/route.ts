import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await prisma.group.findUnique({
      where: { id: params.id },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if member
    const member = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId: params.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Not a member' }, { status: 400 });
    }

    // Don't allow creator to leave
    if (group.ownerId === session.user.id) {
      return NextResponse.json({ error: 'Creator cannot leave the group' }, { status: 400 });
    }

    await prisma.groupMember.delete({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId: params.id,
        },
      },
    });

    // Update member count
    await prisma.group.update({
      where: { id: params.id },
      data: {
        memberCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}