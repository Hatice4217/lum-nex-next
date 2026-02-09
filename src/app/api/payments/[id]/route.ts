// LUMINEX Next.js - Single Payment API Route
// GET /api/payments/[id] - Ödeme detayı
// POST /api/payments/[id] - Ödeme tamamlama (Iyzico entegrasyonu simülasyonu)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
                hospital: {
                  select: {
                    name: true,
                    city: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ödeme bulunamadı' } },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (
      session.user.role === 'PATIENT' &&
      payment.patient.userId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu ödeme için yetkiniz yok' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Payment GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Ödeme bulunamadı' } },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (
      session.user.role === 'PATIENT' &&
      payment.patient.userId !== session.user.id
    ) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu ödeme için yetkiniz yok' } },
        { status: 403 }
      );
    }

    // Zaten tamamlanmış mı?
    if (payment.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_COMPLETED', message: 'Ödeme zaten tamamlanmış' } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { method, cardNumber, cardHolder, expiryDate, cvv } = body;

    // Burada gerçek ödeme provder'ı (Iyzico, Stripe, etc.) çağrılır
    // Simülasyon:
    let paymentProviderResult;
    try {
      // Iyzico/Stripe API call simulation
      paymentProviderResult = {
        success: true,
        transactionId: `txn_${Date.now()}`,
        errorCode: null,
        errorMessage: null,
      };
    } catch (providerError) {
      paymentProviderResult = {
        success: false,
        transactionId: null,
        errorCode: providerError.code,
        errorMessage: providerError.message,
      };
    }

    if (!paymentProviderResult.success) {
      // Ödeme başarısız
      await prisma.payment.update({
        where: { id },
        data: {
          status: 'FAILED',
          failedReason: paymentProviderResult.errorMessage,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PAYMENT_FAILED',
            message: paymentProviderResult.errorMessage || 'Ödeme başarısız oldu',
          },
        },
        { status: 400 }
      );
    }

    // Ödeme başarılı
    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        transactionId: paymentProviderResult.transactionId,
        paidAt: new Date(),
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

    // Randevuyu onayla
    if (payment.appointmentId) {
      await prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });
    }

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        userId: payment.patient.userId,
        type: 'PAYMENT',
        title: 'Ödeme Başarılı',
        message: `Ödemeniz başarıyla alındı: ${updated.amount} TL. İşlem no: ${paymentProviderResult.transactionId}`,
        link: `/payment/${updated.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Ödeme başarıyla tamamlandı',
    });
  } catch (error) {
    console.error('Payment POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
