// LUMINEX Next.js - Payments API Routes
// GET /api/payments - Ödeme listesi
// POST /api/payments - Yeni ödeme oluştur

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { paymentSchema } from '@/lib/validations';

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

    // Hasta sadece kendi ödemelerini görür
    if (session.user.role === 'PATIENT') {
      where.patient = { userId: session.user.id };
    }

    // Admin tüm ödemeleri görür
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          patient: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentNo: true,
              appointmentDate: true,
              doctor: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: payments,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Payments GET error:', error);
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

    if (session.user.role !== 'PATIENT') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Sadece hastalar ödeme oluşturabilir' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = paymentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: result.error } },
        { status: 400 }
      );
    }

    const data = result.data;

    // Hasta profilini bul
    const patient = await prisma.patientProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Hasta profili bulunamadı' } },
        { status: 404 }
      );
    }

    // Appointment kontrol
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { doctor: true },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: { code: 'APPOINTMENT_NOT_FOUND', message: 'Randevu bulunamadı' } },
        { status: 404 }
      );
    }

    // Ödeme oluştur
    const payment = await prisma.payment.create({
      data: {
        patientId: patient.id,
        appointmentId: data.appointmentId,
        amount: appointment.doctor.consultationFee,
        method: data.method,
        status: 'PENDING',
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
        appointment: {
          select: {
            appointmentNo: true,
            doctor: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PAYMENT',
        title: 'Ödeme Bekliyor',
        message: `Randevu ödemeniz: ${appointment.appointmentNo} - ${appointment.doctor.consultationFee} TL`,
        link: `/payment/${payment.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: payment,
      message: 'Ödeme oluşturuldu',
    }, { status: 201 });
  } catch (error) {
    console.error('Payment POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
