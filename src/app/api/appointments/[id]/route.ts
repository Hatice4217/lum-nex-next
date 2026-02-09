// LUMINEX Next.js - Single Appointment API Route
// GET /api/appointments/[id] - Randevu detayı
// PUT /api/appointments/[id] - Randevu güncelle
// DELETE /api/appointments/[id] - Randevu iptal

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cancelAppointmentSchema } from '@/lib/validations';
import { AppointmentStatus } from '@prisma/client';

type Params = Promise<{ id: string }>;

// GET - Randevu detayı
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            patientProfile: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            hospital: true,
            department: true,
          },
        },
        hospital: true,
        department: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Randevu bulunamadı' } },
        { status: 404 }
      );
    }

    // Check access
    const isPatient = session.user.id === appointment.patientId;
    const isDoctor = session.user.role === 'DOCTOR' && session.user.id === appointment.doctor.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu randevuyu görüntüleme yetkiniz yok' } },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Appointment GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

// DELETE - Randevu iptal
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Randevu bulunamadı' } },
        { status: 404 }
      );
    }

    // Check access
    const isPatient = session.user.id === appointment.patientId;
    const isDoctor = session.user.role === 'DOCTOR' && session.user.id === appointment.doctor.userId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Bu randevuyu iptal etme yetkiniz yok' } },
        { status: 403 }
      );
    }

    // Check if can be cancelled
    if (appointment.status === AppointmentStatus.CANCELLED || appointment.status === AppointmentStatus.COMPLETED) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: 'Bu randevu iptal edilemez' } },
        { status: 400 }
      );
    }

    // Get cancellation reason from body
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || 'Kullanıcı tarafından iptal edildi';

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: session.user.id,
      },
    });

    // Create notification
    const notifyUserId = isPatient ? appointment.doctor.userId : appointment.patientId;
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'APPOINTMENT',
        title: 'Randevu İptal Edildi',
        message: `${appointment.appointmentNo} numaralı randevu iptal edildi.`,
        link: `/appointments/${id}`,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'APPOINTMENT_CANCEL',
        entityType: 'Appointment',
        entityId: id,
        description: `Randevu iptal edildi: ${appointment.appointmentNo}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Randevu iptal edildi',
    });
  } catch (error) {
    console.error('Appointment DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
