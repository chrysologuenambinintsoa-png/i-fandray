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

    const group = await prisma.group.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            posts: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Check if user is member
    const member = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId: params.id,
      },
    });

    const isMember = !!member;
    const isAdmin = member?.role === 'admin' || group.ownerId === session.user.id;

    // If group is private and user is not member, don't show full details
    if (group.privacy === 'private' && !isMember) {
      return NextResponse.json({
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          coverPhoto: group.coverPhoto,
          category: group.category,
          privacy: group.privacy,
          memberCount: group.memberCount,
          createdAt: group.createdAt,
        },
        members: [],
        isMember: false,
        isAdmin: false,
      });
    }

    return NextResponse.json({
      group: {
        ...group,
        memberCount: group._count.members,
      },
      members: group.members,
      isMember,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    // Check if user is admin
    const member = await prisma.groupMember.findFirst({
      where: {
        userId: session.user.id,
        groupId: params.id,
      },
    });

    const isAdmin = member?.role === 'admin' || group.ownerId === session.user.id;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, avatar, coverPhoto, privacy, rules, category } = body;

    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: {
        name,
        description,
        avatar,
        coverPhoto,
        privacy,
        rules,
        category,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Only creator can delete
    if (group.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.group.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}