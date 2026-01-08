import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Protection: header x-admin-key ou Authorization: Bearer <key>
    const headerKey = request.headers.get('x-admin-key') || '';
    const authHeader = request.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';
    const adminKey = headerKey || bearer;

    if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      dateOfBirth,
      gender,
      isVerified = true,
      isActive = true,
    } = body;

    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Vérifier l'existence
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      if (existing.email === email) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      if (existing.username === username) return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashed,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        isVerified,
        isActive,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'User created', user }, { status: 201 });
  } catch (err) {
    console.error('[api/admin/create-user] error:', err);
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err && (err.message || String(err)));
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
