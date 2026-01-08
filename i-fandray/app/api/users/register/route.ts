import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      dateOfBirth,
      gender,
    } = body;

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!firstName || firstName.trim() === '') missingFields.push('firstName');
    if (!lastName || lastName.trim() === '') missingFields.push('lastName');
    if (!username || username.trim() === '') missingFields.push('username');
    if (!email || email.trim() === '') missingFields.push('email');
    if (!password || password.trim() === '') missingFields.push('password');

    if (missingFields.length > 0) {
      console.error('[api/users/register] Missing fields:', missingFields, 'Body:', body);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }
      if (existingUser.username === username) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        isVerified: true,
        isActive: true,
        language: true,
        theme: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    // Log the error detail to help debugging (show message in non-production)
    console.error('[api/users/register] error:', error);
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (error && (error.message || String(error)));
    return NextResponse.json({ error: message || 'Internal server error' }, { status: 500 });
  }
}
