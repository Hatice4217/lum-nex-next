// LUMINEX - Admin Licenses API
// GET /api/admin/licenses - List all licenses
// POST /api/admin/licenses - Create new license

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const licenseSchema = z.object({
  key: z.string().min(16).optional(),
  domain: z.string().min(2),
  isActive: z.boolean().default(true),
  expiresAt: z.string().transform(str => new Date(str)),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  licenseType: z.enum(['BASIC', 'PROFESSIONAL', 'ENTERPRISE']).default('PROFESSIONAL'),
  maxUsers: z.number().optional(),
  maxDoctors: z.number().optional(),
  notes: z.string().optional()
});

// Generate random license key
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];

  for (let i = 0; i < 4; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(segment);
  }

  return segments.join('-');
}

// GET - List all licenses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const where: any = {};

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [licenses, total] = await Promise.all([
      prisma.license.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.license.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      licenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Licenses GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Lisanslar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Create new license
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if domain already has a license
    const existing = await prisma.license.findUnique({
      where: { domain: body.domain }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bu domain için zaten bir lisans mevcut' },
        { status: 400 }
      );
    }

    // Generate license key if not provided
    const licenseKey = body.key || generateLicenseKey();

    const validatedData = licenseSchema.parse({
      ...body,
      key: licenseKey
    });

    const license = await prisma.license.create({
      data: {
        ...validatedData,
        expiresAt: validatedData.expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      license
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veri', details: error.errors },
        { status: 400 }
      );
    }

    console.error('License POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Lisans oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
