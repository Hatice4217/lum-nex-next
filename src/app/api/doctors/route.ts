// LUMINEX Next.js - Doctors API Route
// GET /api/doctors - Doktor listesi ve filtreleme

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const department = searchParams.get('department');
    const hospital = searchParams.get('hospital');
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const minRating = searchParams.get('minRating');
    const maxFee = searchParams.get('maxFee');
    const isOnlineAvailable = searchParams.get('isOnlineAvailable');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '12');
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {
      user: {
        isActive: true,
      },
    };

    // Department filter
    if (department) {
      where.department = {
        slug: department,
      };
    }

    // Hospital filter
    if (hospital) {
      where.hospital = {
        slug: hospital,
      };
    }

    // City filter (through hospital)
    if (city) {
      where.hospital = {
        ...where.hospital,
        city,
      };
    }

    // Search (name or license)
    if (search) {
      where.user = {
        ...where.user,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    // Rating filter
    if (minRating) {
      where.rating = {
        gte: parseFloat(minRating),
      };
    }

    // Fee filter
    if (maxFee) {
      where.consultationFee = {
        lte: parseFloat(maxFee),
      };
    }

    // Online availability
    if (isOnlineAvailable === 'true') {
      where.isAvailable = true;
    }

    // Get total count
    const total = await prisma.doctorProfile.count({ where });

    // Get doctors
    const doctors = await prisma.doctorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        hospital: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            district: true,
            logo: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { totalReviews: 'desc' },
      ],
      skip,
      take: perPage,
    });

    // Format response
    const formattedDoctors = doctors.map((doctor) => ({
      id: doctor.id,
      userId: doctor.user.id,
      firstName: doctor.user.firstName,
      lastName: doctor.user.lastName,
      fullName: `${doctor.user.firstName} ${doctor.user.lastName}`,
      title: doctor.title,
      avatar: doctor.user.avatar,
      hospital: doctor.hospital,
      department: doctor.department,
      rating: doctor.rating,
      totalReviews: doctor.totalReviews,
      consultationFee: doctor.consultationFee,
      isAvailable: doctor.isAvailable,
      experience: doctor.experience,
      biography: doctor.biography,
      languages: doctor.languages ? JSON.parse(doctor.languages) : [],
    }));

    return NextResponse.json({
      success: true,
      data: formattedDoctors,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Doctors GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
