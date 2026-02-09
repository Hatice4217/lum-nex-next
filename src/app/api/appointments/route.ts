// LUMINEX Next.js - Appointments API Route
// GET /api/appointments - Randevu listesi
// POST /api/appointments - Yeni randevu oluştur

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { appointmentSchema } from '@/lib/validations';
import { AppointmentStatus } from '@prisma/client';

// GET - Randevu listesi
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Oturum açmalısınız' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {};

    // Filter by user role
    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.id;
    } else if (session.user.role === 'DOCTOR') {
      where.doctorId = session.user.id;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.appointment.count({ where });

    // Get appointments
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
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
            hospital: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { startTime: 'asc' },
      ],
      skip,
      take: perPage,
    });

    return NextResponse.json({
      success: true,
      data: appointments,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Appointments GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}

// POST - Yeni randevu oluştur
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
        { success: false, error: { code: 'FORBIDDEN', message: 'Sadece hastalar randevu oluşturabilir' } },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate
    const result = appointmentSchema.safeParse(body);

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

    // Check if doctor exists
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: data.doctorId },
      include: {
        user: true,
        hospital: true,
        department: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: { code: 'DOCTOR_NOT_FOUND', message: 'Doktor bulunamadı' } },
        { status: 404 }
      );
    }

    // Check for conflicting appointments
    const conflicting = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        appointmentDate: new Date(data.appointmentDate),
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } },
            ],
          },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { success: false, error: { code: 'SLOT_NOT_AVAILABLE', message: 'Bu saat dolu' } },
        { status: 409 }
      );
    }

    // Generate appointment number
    const appointmentCount = await prisma.appointment.count();
    const appointmentNo = `RNV${new Date().getFullYear()}${String(appointmentCount + 1).padStart(6, '0')}`;

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        appointmentNo,
        patientId: session.user.id,
        doctorId: data.doctorId,
        hospitalId: data.hospitalId || doctor.hospitalId,
        departmentId: data.departmentId || doctor.departmentId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        reason: data.reason,
        symptoms: data.symptoms,
        notes: data.notes,
        isOnline: data.isOnline,
        status: AppointmentStatus.PENDING,
      },
      include: {
        doctor: {
          include: {
            user: true,
            hospital: true,
            department: true,
          },
        },
        hospital: true,
        department: true,
      },
    });

    // Create notification for doctor
    await prisma.notification.create({
      data: {
        userId: doctor.user.id,
        type: 'APPOINTMENT',
        title: 'Yeni Randevu Talebi',
        message: `${session.user.firstName} ${session.user.lastName} tarafından yeni bir randevu talebi var.`,
        link: `/doctor/appointments/${appointment.id}`,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'APPOINTMENT_CREATE',
        entityType: 'Appointment',
        entityId: appointment.id,
        description: `Randevu oluşturuldu: ${appointmentNo}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: appointment,
        message: 'Randevu talebiniz oluşturuldu. Doktor onayladığında bildirim alacaksınız.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Appointment POST error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
