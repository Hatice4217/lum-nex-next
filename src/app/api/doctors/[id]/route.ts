// LUMINEX Next.js - Single Doctor API Route
// GET /api/doctors/[id] - Doktor detayı

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            gender: true,
          },
        },
        hospital: true,
        department: true,
        blockedSlots: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Doktor bulunamadı' } },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const education = doctor.education ? JSON.parse(doctor.education) : [];
    const specializations = doctor.specializations ? JSON.parse(doctor.specializations) : [];
    const languages = doctor.languages ? JSON.parse(doctor.languages) : [];
    const schedule = doctor.schedule ? JSON.parse(doctor.schedule) : null;

    // Format response
    const formattedDoctor = {
      id: doctor.id,
      userId: doctor.user.id,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      fullName: `${doctor.user.firstName} ${doctor.user.lastName}`,
      email: doctor.user.email,
      phone: doctor.user.phone,
      avatar: doctor.user.avatar,
      gender: doctor.user.gender,
      title: doctor.title,
      licenseNo: doctor.licenseNo,
      hospital: doctor.hospital,
      department: doctor.department,
      experience: doctor.experience,
      education,
      specializations,
      biography: doctor.biography,
      consultationFee: doctor.consultationFee,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
      languages,
      schedule,
      isAvailable: doctor.isAvailable,
      blockedSlots: doctor.blockedSlots.map((slot) => ({
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason: slot.reason,
      })),
    };

    // Get upcoming appointments (for availability check)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        appointmentDate: true,
        startTime: true,
        endTime: true,
      },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...formattedDoctor,
        upcomingAppointments,
      },
    });
  } catch (error) {
    console.error('Doctor GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
