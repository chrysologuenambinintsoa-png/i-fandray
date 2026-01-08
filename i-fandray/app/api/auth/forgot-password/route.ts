import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    

    const body = await request.json();
    

    const { email } = body;

    if (!email) {
      
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    

    if (!user) {
      // Don't reveal if email exists or not for security
      
      return NextResponse.json(
        { message: 'If an account with this email address exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    
    

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'noreply@ifandray.com',
      to: email,
      subject: 'Reset your i-fandray password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Reset your password</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your i-fandray account. Click the link below to reset your password:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <p>Best regards,<br>The i-fandray Team</p>
        </div>
      `,
    });

    
    return NextResponse.json(
      { message: 'If an account with this email address exists, a password reset link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
