// LUMINEX - Admin Departments API
// GET /api/admin/departments - List all departments
// POST /api/admin/departments - Create new department

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const departmentSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  hospitalId: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true)
});

// GET - List all departments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const hospitalId = searchParams.get('hospitalId') || '';
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          hospital: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              doctors: true
            }
          }
        },
        orderBy: { name: 'asc' }
      }),
      prisma.department.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Departments GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Departmanlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = departmentSchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.department.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu slug zaten kullanımda' },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      department
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Department POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Departman oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
