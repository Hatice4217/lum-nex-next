// LUMINEX - Demo Payment API Endpoint
// POST /api/payments/demo

import { NextRequest, NextResponse } from 'next/server';
import { createDemoPayment, getAllPlans } from '@/lib/payment/demo-payment.service';
import { z } from 'zod';

// ============================================
// VALIDATION SCHEMA
// ============================================

const paymentSchema = z.object({
  planId: z.enum(['basic', 'professional', 'enterprise']),
  cardNumber: z.string().min(13).max(19),
  cardHolder: z.string().min(2),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
  cvv: z.string().min(3).max(4)
});

// ============================================
// GET /api/payments/demo - Tüm planları getir
// ============================================

export async function GET() {
  try {
    const plans = getAllPlans();

    return NextResponse.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Planlar yüklenirken hata oluştu'
      },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/payments/demo - Demo ödeme oluştur
// ============================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = paymentSchema.parse(body);

    // Kullanıcı ID'si - Gerçek uygulamada session'dan alınacak
    // Demo için hardcoded
    const userId = req.headers.get('x-user-id') || 'demo-user-id';

    // Ödeme oluştur
    const paymentResult = await createDemoPayment(validatedData, userId);

    return NextResponse.json({
      success: true,
      payment: paymentResult
    });
  } catch (error) {
    console.error('Demo payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz veri',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Ödeme işleminde hata oluştu'
      },
      { status: 500 }
    );
  }
}
