// LUMINEX Next.js - Departments API Route
// GET /api/departments - Bölüm listesi

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const hospitalId = searchParams.get('hospital');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '50');
    const skip = (page - 1) * perPage;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    // Get total count
    const total = await prisma.department.count({ where });

    // Get departments
    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: {
            doctors: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: perPage,
    });

    // Format response
    const formattedDepartments = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      icon: dept.icon,
      description: dept.description,
      hospitalId: dept.hospitalId,
      doctorsCount: dept._count.doctors,
    }));

    return NextResponse.json({
      success: true,
      data: formattedDepartments,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Departments GET error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Bir hata oluştu' } },
      { status: 500 }
    );
  }
}
