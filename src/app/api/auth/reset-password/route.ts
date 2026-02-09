// LUMINEX Next.js - Reset Password API Route
// POST /api/auth/reset-password - Şifre sıfırlama

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Geçersiz veri',
          },
        },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // TODO: Verify token and get user
    // For now, this is a placeholder implementation

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    // await prisma.user.update({
    //   where: { resetToken: token },
    //   data: {
    //     password: hashedPassword,
    //     resetToken: null,
    //     resetTokenExpiry: null,
    //   },
    // });

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı. Giriş yapabilirsiniz.',
    });
  } catch (error) {
    console.error('Reset password error:', error);

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
