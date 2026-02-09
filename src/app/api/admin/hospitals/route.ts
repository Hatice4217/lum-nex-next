// LUMINEX - Admin Hospitals API
// GET /api/admin/hospitals - List all hospitals
// POST /api/admin/hospitals - Create new hospital

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const hospitalSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  facilities: z.string().optional(),
  workingHours: z.string().optional(),
  emergencyService: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

// GET - List all hospitals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [hospitals, total] = await Promise.all([
      prisma.hospital.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              doctors: true,
              departments: true,
              appointments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hospital.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      hospitals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Hospitals GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Hastaneler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create new hospital
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = hospitalSchema.parse(body);

    // Check if slug is unique
    const existing = await prisma.hospital.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu slug zaten kullanımda' },
        { status: 400 }
      );
    }

    const hospital = await prisma.hospital.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      hospital
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Hospital POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Hastane oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
