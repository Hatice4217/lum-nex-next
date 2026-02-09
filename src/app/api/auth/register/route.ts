// LUMINEX Next.js - Register API Route
// POST /api/auth/register - Hasta ve Doktor kaydı

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, validateTcKimlikNo } from '@/lib/auth';
import { UserRole, Gender } from '@prisma/client';
import { registerPatientSchema, registerDoctorSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate based on role
    const role = body.role as UserRole;

    let result;
    if (role === UserRole.DOCTOR) {
      result = registerDoctorSchema.safeParse(body);
    } else {
      result = registerPatientSchema.safeParse(body);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Geçersiz veri',
            details: result.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Bu e-posta adresi zaten kullanımda.',
          },
        },
        { status: 400 }
      );
    }

    // Check if TC Kimlik No already exists
    if (data.tcKimlikNo) {
      const existingTc = await prisma.user.findUnique({
        where: { tcKimlikNo: data.tcKimlikNo },
      });

      if (existingTc) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TCKIMLIK_EXISTS',
              message: 'Bu TC Kimlik numarası zaten kullanımda.',
            },
          },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        tcKimlikNo: data.tcKimlikNo,
        phone: data.phone,
        role: role,
        gender: data.gender ? (data.gender as Gender) : null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      },
    });

    // Create role-specific profile
    if (role === UserRole.PATIENT) {
      await prisma.patientProfile.create({
        data: {
          userId: user.id,
        },
      });
    } else if (role === UserRole.DOCTOR) {
      await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          licenseNo: (data as any).licenseNo,
          title: (data as any).title,
          experience: (data as any).experience,
          biography: (data as any).biography,
          consultationFee: (data as any).consultationFee
            ? Number((data as any).consultationFee)
            : null,
        },
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        description: `${role} kullanıcı kaydı oluşturuldu`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
        message: 'Kayıt başarılı. Giriş yapabilirsiniz.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);

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
