import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { mobile, code } = await request.json();

    if (!mobile || !code) {
      return NextResponse.json({ error: 'Mobile number and code are required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { mobile },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if code matches and not expired
    if (user.smsCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (!user.smsCodeExpiry || user.smsCodeExpiry < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Clear the code
    await prisma.user.update({
      where: { mobile },
      data: {
        smsCode: null,
        smsCodeExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Code verified successfully' });
  } catch (error) {
    console.error('Error verifying SMS:', error);
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}