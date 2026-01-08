import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Debug: log incoming cookie header and named session cookie from NextRequest
    try {
      const cookieHeader = request.headers.get('cookie') || null;
      const namedCookie = request.cookies.get('next-auth.session-token')?.value || null;
      console.debug('[upload] cookie header present:', !!cookieHeader);
      console.debug('[upload] next-auth.session-token present:', !!namedCookie);
    } catch (cookieErr) {
      console.debug('[upload] error reading cookies from request:', cookieErr);
    }

    let session = await getServerSession(authOptions);
    console.debug('[upload] server session present:', !!session);

    // Fallbacks if session.user.id is missing
    if (!session?.user?.id) {
      // 1) Try getToken
      try {
        const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
        if (token) {
          // @ts-ignore
          session = { user: { id: token.id || token.sub } } as any;
          console.debug('[upload] session recovered from token:', !!session?.user?.id);
        }
      } catch (tokErr) {
        console.debug('[upload] getToken fallback failed:', tokErr);
      }

      // 2) If still missing, try to read session from DB using session token cookie
      if (!session?.user?.id) {
        try {
          const cookieVal = request.cookies.get('next-auth.session-token')?.value;
          console.debug('[upload] session cookie value found:', !!cookieVal);
          if (cookieVal) {
            const sessionRecord = await prisma.session.findUnique({ where: { sessionToken: cookieVal } });
            if (sessionRecord?.userId) {
              session = { user: { id: sessionRecord.userId } } as any;
              console.debug('[upload] session recovered from prisma.Session userId:', sessionRecord.userId);
            }
          }
        } catch (dbErr) {
          console.debug('[upload] prisma session lookup failed:', dbErr);
        }
      }
    }

    if (!session?.user?.id) {
      console.warn('[upload] Unauthorized upload attempt; session missing');
      return NextResponse.json({ error: 'Unauthorized - no session on server', cookiePresent: !!request.headers.get('cookie') }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (100MB limit for videos, 10MB for others)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for others
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max size: ${isVideo ? '100MB' : '10MB'}` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Save file locally first, fallback to S3 if local write fails
    const filepath = join(uploadsDir, filename);
    let fileUrl = `/uploads/${filename}`;
    let thumbnailUrl = fileUrl; // Default thumbnail

    try {
      await writeFile(filepath, buffer);
    } catch (fsErr) {
      console.error('[upload] local write failed, attempting Cloudinary/S3 fallback:', fsErr);

      const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

      // Try Cloudinary first if configured
      if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
        try {
          cloudinary.config({
            cloud_name: CLOUDINARY_CLOUD_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_API_SECRET,
          });

          const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
          const uploadResult = await cloudinary.uploader.upload(dataUri, {
            resource_type: file.type.startsWith('video/') ? 'video' : 'image',
            folder: 'uploads',
            public_id: filename.replace(/\.[^/.]+$/, ''),
          });

          fileUrl = uploadResult.secure_url || uploadResult.url;
          console.debug('[upload] uploaded to Cloudinary:', fileUrl);
        } catch (cErr) {
          console.error('[upload] Cloudinary fallback failed:', cErr);

          // If Cloudinary fails, fall back to S3 if configured
          const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION } = process.env;
          if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
            try {
              const s3 = new S3Client({ region: AWS_REGION || 'us-east-1' });
              const key = `uploads/${filename}`;
              await s3.send(new PutObjectCommand({
                Bucket: AWS_S3_BUCKET,
                Key: key,
                Body: buffer,
                ContentType: file.type,
                ACL: 'public-read',
              }));

              const regionSegment = AWS_REGION && AWS_REGION !== 'us-east-1' ? `.${AWS_REGION}` : '';
              fileUrl = `https://${AWS_S3_BUCKET}.s3${regionSegment}.amazonaws.com/${key}`;
              console.debug('[upload] uploaded to S3:', fileUrl);
            } catch (s3Err) {
              console.error('[upload] S3 fallback also failed:', s3Err);
              return NextResponse.json({ error: 'Failed to save file locally, to Cloudinary and to S3' }, { status: 500 });
            }
          } else {
            console.warn('[upload] S3 credentials or bucket missing; cannot fallback to S3');
            return NextResponse.json({ error: 'Failed to save file locally and Cloudinary failed; no S3 fallback configured' }, { status: 500 });
          }
        }

      } else {
        // Cloudinary not configured; try S3
        const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION } = process.env;
        if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
          try {
            const s3 = new S3Client({ region: AWS_REGION || 'us-east-1' });
            const key = `uploads/${filename}`;
            await s3.send(new PutObjectCommand({
              Bucket: AWS_S3_BUCKET,
              Key: key,
              Body: buffer,
              ContentType: file.type,
              ACL: 'public-read',
            }));

            const regionSegment = AWS_REGION && AWS_REGION !== 'us-east-1' ? `.${AWS_REGION}` : '';
            fileUrl = `https://${AWS_S3_BUCKET}.s3${regionSegment}.amazonaws.com/${key}`;
            console.debug('[upload] uploaded to S3:', fileUrl);
          } catch (s3Err) {
            console.error('[upload] S3 fallback also failed:', s3Err);
            return NextResponse.json({ error: 'Failed to save file locally and to S3' }, { status: 500 });
          }
        } else {
          console.warn('[upload] No Cloudinary or S3 credentials configured; cannot fallback');
          return NextResponse.json({ error: 'Failed to save file locally and no fallback configured' }, { status: 500 });
        }
      }
    }

    // For videos, use a placeholder thumbnail
    if (file.type.startsWith('video/')) {
      thumbnailUrl = '/images/video-placeholder.svg';
    }

    return NextResponse.json({
      url: fileUrl,
      thumbnailUrl,
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'audio',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
