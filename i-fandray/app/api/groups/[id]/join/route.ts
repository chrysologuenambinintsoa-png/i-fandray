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

    // Check if already member
    const existingMember = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId: params.id,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // For private groups, this would need approval, but for now allow direct join
    await prisma.groupMember.create({
      data: {
        groupId: params.id,
        userId: session.user.id,
        role: 'member',
      },
    });

    // Update member count
    await prisma.group.update({
      where: { id: params.id },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}