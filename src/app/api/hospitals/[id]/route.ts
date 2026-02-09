// LUMINEX Next.js - Single Hospital API Route
// GET /api/hospitals/[id] - Hastane detayı

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        departments: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                doctors: true,
              },
            },
          },
        },
        doctors: {
          where: {
            user: {
              isActive: true,
            },
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            department: true,
          },
          take: 10,
          orderBy: {
            rating: 'desc',
          },
        },
      },
    });

    if (!hospital) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Hastane bulunamadı' } },
        { status: 404 }
      );
    }

    // Format response
    const formattedHospital = {
      id: hospital.id,
      name: hospital.name,
      slug: hospital.slug,
      address: hospital.address,
      city: hospital.city,
      district: hospital.district,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      logo: hospital.logo,
      image: hospital.image,
      description: hospital.description,
      facilities: hospital.facilities ? JSON.parse(hospital.facilities) : [],
      workingHours: hospital.workingHours ? JSON.parse(hospital.workingHours) : null,
      emergencyService: hospital.emergencyService,
      rating: hospital.rating,
      totalReviews: hospital.totalReviews,
      departments: hospital.departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        icon: dept.icon,
        doctorsCount: dept._count.doctors,
      })),
      doctors: hospital.doctors.map((doctor) => ({
        id: doctor.id,
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        fullName: `${doctor.user.firstName} ${doctor.user.lastName}`,
        title: doctor.title,
        avatar: doctor.user.avatar,
        department: doctor.department,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        consultationFee: doctor.consultationFee,
        isAvailable: doctor.isAvailable,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedHospital,
    });
  } catch (error) {
    console.error('Hospital GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
