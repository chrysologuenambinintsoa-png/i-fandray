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

    // Count pending friend requests received by the user
    const pendingRequestsCount = await prisma.friendRequest.count({
      where: {
        receiverId: session.user.id,
        status: 'pending',
      },
    });

    return NextResponse.json({ count: pendingRequestsCount });
  } catch (error) {
    console.error('Error fetching friend requests count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}