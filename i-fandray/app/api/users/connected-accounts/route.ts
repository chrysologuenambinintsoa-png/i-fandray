import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get connected accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        provider: true,
        providerAccountId: true,
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching connected accounts:', error);
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
    const { provider } = body;

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if account is already linked
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId,
        provider,
      },
    });

    if (existingAccount) {
      return NextResponse.json({ error: 'Account already linked' }, { status: 400 });
    }

    // Redirect to OAuth sign in
    // This will be handled by the client-side signIn call
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error linking account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider || !['google', 'facebook'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if user has password (credentials) before unlinking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user?.password) {
      return NextResponse.json({ error: 'Cannot unlink account without password set' }, { status: 400 });
    }

    // Unlink account
    await prisma.account.deleteMany({
      where: {
        userId,
        provider,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unlinking account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}