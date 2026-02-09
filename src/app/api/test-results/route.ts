// LUMINEX Next.js - Test Results API Routes
// GET /api/test-results - Tahlil sonucu listesi
// POST /api/test-results - Yeni tahlil sonucu ekle

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const testResultSchema = z.object({
  patientId: z.string().cuid(),
  appointmentId: z.string().cuid().optional(),
  testName: z.string().min(2, 'Test adı en az 2 karakter olmalı'),
  testType: z.enum(['BLOOD', 'URINE', 'XRAY', 'MRI', 'CT', 'ULTRASOUND', 'BIOPSY', 'OTHER']),
  result: z.string().min(1, 'Sonuç boş olamaz'),
  normalRange: z.string().optional(),
  isAbnormal: z.boolean().default(false),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const abnormal = searchParams.get('abnormal');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    const where: any = {};

    // Hasta sadece kendi sonuçlarını görür
    if (session.user.role === 'PATIENT') {
      where.patient = { userId: session.user.id };
    }

    // Doktor hastalarının sonuçlarını görür
    if (session.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (doctor) {
        // Doktorun randevularındaki hastaların sonuçları
        const appointmentIds = await prisma.appointment.findMany({
          where: { doctorId: doctor.id },
          select: { id: true },
        });
        where.appointmentId = {
          in: appointmentIds.map((a) => a.id),
        };
      }
    }

    if (type) {
      where.testType = type;
    }

    if (abnormal === 'true') {
      where.isAbnormal = true;
    }

    const [testResults, total] = await Promise.all([
      prisma.testResult.findMany({
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentNo: true,
              appointmentDate: true,
            },
          },
        },
        orderBy: { testDate: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.testResult.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: testResults,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Test Results GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    if (session.user.role !== 'DOCTOR' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu işlem için yetkiniz yok' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = testResultSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: result.error } },
        { status: 400 }
      );
    }

    const data = result.data;

    // Hasta kontrol
    const patient = await prisma.patientProfile.findUnique({
      where: { id: data.patientId },
      include: { user: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Hasta bulunamadı' } },
        { status: 404 }
      );
    }

    // Test sonucu no oluştur
    const resultNo = await generateTestResultNo(data.testType);

    // Test sonucunu kaydet
    const testResult = await prisma.testResult.create({
      data: {
        resultNo,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        testName: data.testName,
        testType: data.testType,
        result: data.result,
        normalRange: data.normalRange,
        isAbnormal: data.isAbnormal,
        notes: data.notes,
        testDate: new Date(),
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Hasta bildirimi
    const urgency = data.isAbnormal ? 'ACİL ' : '';
    await prisma.notification.create({
      data: {
        userId: patient.user.id,
        type: 'TEST_RESULT',
        title: `${urgency}Tahlil Sonucunuz Hazır`,
        message: `${data.testName} test sonucunuz hazır: ${resultNo}. ${data.isAbnormal ? 'Lütfen doktorunuzla görüşün.' : ''}`,
        link: `/test-results/${testResult.id}`,
      },
    });

    // Email gönderimi (opsiyonel)
    // await sendTestResultEmail(patient.user.email, testResult);

    return NextResponse.json({
      success: true,
      data: testResult,
      message: 'Tahlil sonucu başarıyla eklendi',
    }, { status: 201 });
  } catch (error) {
    console.error('Test Result POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

// Test sonucu no oluşturma yardımcı fonksiyonu
async function generateTestResultNo(testType: string): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // Bugünkü test sayısını bul
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.testResult.count({
    where: {
      testDate: {
        gte: today,
        lt: tomorrow,
      },
      testType,
    },
  });

  const sequence = String(count + 1).padStart(3, '0');
  const typeCode = {
    BLOOD: 'KAN',
    URINE: 'İDR',
    XRAY: 'RGN',
    MRI: 'MR',
    CT: 'BT',
    ULTRASOUND: 'US',
    BIOPSY: 'BYP',
    OTHER: 'DİĞ',
  }[testType] || 'DİĞ';

  return `${typeCode}${year}${month}${day}${sequence}`;
}
