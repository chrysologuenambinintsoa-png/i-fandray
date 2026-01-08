import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.smsCode !== code) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (!user.smsCodeExpiry || user.smsCodeExpiry < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Clear the code
    await prisma.user.update({ where: { email }, data: { smsCode: null, smsCodeExpiry: null } });

    return NextResponse.json({ message: 'Code verified successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify code' }, { status: 500 });
  }
}
