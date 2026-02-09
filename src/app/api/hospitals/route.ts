// LUMINEX Next.js - Hospitals API Route
// GET /api/hospitals - Hastane listesi

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '20');
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.hospital.count({ where });

    // Get hospitals
    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        _count: {
          select: {
            doctors: true,
            departments: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' },
      ],
      skip,
      take: perPage,
    });

    // Format response
    const formattedHospitals = hospitals.map((hospital) => ({
      id: hospital.id,
      name: hospital.name,
      slug: hospital.slug,
      city: hospital.city,
      district: hospital.district,
      logo: hospital.logo,
      image: hospital.image,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      description: hospital.description,
      emergencyService: hospital.emergencyService,
      rating: hospital.rating,
      totalReviews: hospital.totalReviews,
      facilities: hospital.facilities ? JSON.parse(hospital.facilities) : [],
      workingHours: hospital.workingHours ? JSON.parse(hospital.workingHours) : null,
      doctorsCount: hospital._count.doctors,
      departmentsCount: hospital._count.departments,
    }));

    return NextResponse.json({
      success: true,
      data: formattedHospitals,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Hospitals GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
