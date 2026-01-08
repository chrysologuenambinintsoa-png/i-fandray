import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Do not reveal whether the email exists
      return NextResponse.json({ message: 'If an account exists, a verification code was sent.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code on user (reusing smsCode fields)
    await prisma.user.update({ where: { email }, data: { smsCode: code, smsCodeExpiry: expiry } });

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'noreply@ifandray.com',
      to: email,
      subject: 'Your i-fandray verification code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Your verification code</h2>
          <p>Hello,</p>
          <p>Your i-fandray password reset verification code is:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br/>The i-fandray Team</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Verification code sent if account exists' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
