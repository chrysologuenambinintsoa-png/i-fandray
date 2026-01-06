import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const id = searchParams.get('id');

    if (!username && !id) {
      return NextResponse.json({ error: 'Username or ID is required' }, { status: 400 });
    }

    let user;

    if (username) {
      user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          bio: true,
          location: true,
          website: true,
          avatar: true,
          coverPhoto: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              friendOf: true,
              friends: true,
              pages: true,
            }
          }
        }
      });
    } else if (id) {
      user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          email: true,
          bio: true,
          location: true,
          website: true,
          avatar: true,
          coverPhoto: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              posts: true,
              friendOf: true,
              friends: true,
              pages: true,
            }
          }
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}