// LUMINEX Next.js - Prescriptions API Routes
// GET /api/prescriptions - Reçete listesi
// POST /api/prescriptions - Yeni reçete oluştur

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { prescriptionSchema } from '@/lib/validations';

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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');

    const where: any = {};

    // Hasta sadece kendi reçetelerini görür
    if (session.user.role === 'PATIENT') {
      where.patient = { userId: session.user.id };
    }

    // Doktor yazdığı reçeteleri görür
    if (session.user.role === 'DOCTOR') {
      const doctor = await prisma.doctorProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (doctor) {
        where.doctorId = doctor.id;
      }
    }

    // Sadece geçerli reçeteler
    if (status === 'active') {
      where.validUntil = { gte: new Date() };
    } else if (status === 'expired') {
      where.validUntil = { lt: new Date() };
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
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
          doctor: {
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
        },
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.prescription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: prescriptions,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Prescriptions GET error:', error);
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

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Sadece doktorlar reçete yazabilir' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = prescriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: result.error } },
        { status: 400 }
      );
    }

    const data = result.data;

    // Doktor profilini bul
    const doctor = await prisma.doctorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: { code: 'DOCTOR_NOT_FOUND', message: 'Doktor profili bulunamadı' } },
        { status: 404 }
      );
    }

    // Reçete no oluştur
    const prescriptionNo = await generatePrescriptionNo();

    // Reçete oluştur
    const prescription = await prisma.prescription.create({
      data: {
        prescriptionNo,
        doctorId: doctor.id,
        patientId: data.patientId,
        diagnosis: data.diagnosis,
        medications: data.medications,
        usage: data.usage,
        notes: data.notes,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
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
        doctor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Hasta bildirimi
    await prisma.notification.create({
      data: {
        userId: prescription.patient.userId,
        type: 'PRESCRIPTION',
        title: 'Yeni Reçeteniz Var',
        message: `Dr. ${doctor.user.firstName} ${doctor.user.lastName} size yeni bir reçete yazdı: ${prescriptionNo}`,
        link: `/prescriptions/${prescription.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Reçete başarıyla oluşturuldu',
    }, { status: 201 });
  } catch (error) {
    console.error('Prescription POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

// Reçete no oluşturma yardımcı fonksiyonu
async function generatePrescriptionNo(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  // Bugünün reçete sayısını bul
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.prescription.count({
    where: {
      issuedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const sequence = String(count + 1).padStart(4, '0');
  return `RCT${year}${month}${sequence}`;
}
