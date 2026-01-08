import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'avatar' | 'cover';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!type || !['avatar', 'cover'].includes(type)) {
      return NextResponse.json({ error: 'Invalid photo type' }, { status: 400 });
    }

    // We cannot use uploadToCloudinary from lib/upload on the server side directly
    // because it expects a File object from the browser. Instead, we'll use Cloudinary API directly.
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataURI = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: `users/${session.user.id}/${type}`,
      public_id: `${type}-${Date.now()}`,
      resource_type: 'auto',
    });

    if (!result.secure_url) {
      throw new Error('Upload failed');
    }

    const userId = session.user.id;

    // Update user profile with new photo URL
    const updateData: any = {};
    if (type === 'avatar') {
      updateData.avatar = result.secure_url;
    } else if (type === 'cover') {
      updateData.coverPhoto = result.secure_url;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        _count: {
          select: {
            friendOf: true,
            friends: true,
            posts: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
