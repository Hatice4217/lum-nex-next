// LUMINEX Next.js - Forgot Password API Route
// POST /api/auth/forgot-password - Şifre sıfırlama bağlantısı gönder

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { forgotPasswordSchema } from '@/lib/validations';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Geçersiz e-posta adresi',
          },
        },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour

    // In production, you would store this in a separate table or add fields to User model
    // For now, we'll create a notification with the token
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: 'Şifre Sıfırlama İsteği',
        message: `Şifre sıfırlama token: ${resetToken}`,
      },
    });

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      success: true,
      message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        },
      },
      { status: 500 }
    );
  }
}
