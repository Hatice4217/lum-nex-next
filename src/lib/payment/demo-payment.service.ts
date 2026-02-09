// LUMINEX - Demo Payment Service
// Ücretsiz demo ödeme sistemi - Gerçek ödeme yok, simülasyon var

import { prisma } from '@/lib/db';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DemoPaymentRequest {
  planId: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface DemoPaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  message: string;
  timestamp: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameTr: string;
  price: number;
  currency: string;
  duration: number; // Ay sayısı
  features: string[];
  featuresTr: string[];
  popular?: boolean;
}

// ============================================
// ABONELİK PLANLARI
// ============================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameTr: 'Temel Plan',
    price: 1499,
    currency: 'TRY',
    duration: 1,
    features: [
      'Up to 3 doctor profiles',
      '50 appointments per month',
      'Basic reporting',
      'Email support',
      'Mobile access'
    ],
    featuresTr: [
      'En fazla 3 doktor profili',
      'Aylık 50 randevu',
      'Temel raporlama',
      'E-posta desteği',
      'Mobil erişim'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    nameTr: 'Profesyonel Plan',
    price: 3999,
    currency: 'TRY',
    duration: 1,
    popular: true,
    features: [
      'Up to 10 doctor profiles',
      '200 appointments per month',
      'Advanced reporting',
      'Priority support',
      'Mobile + Tablet access',
      'Appointment reminders',
      'Patient management',
      'Prescription templates'
    ],
    featuresTr: [
      'En fazla 10 doktor profili',
      'Aylık 200 randevu',
      'Gelişmiş raporlama',
      'Öncelikli destek',
      'Mobil + Tablet erişimi',
      'Randevu hatırlatıcıları',
      'Hasta yönetimi',
      'Reçete şablonları'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    nameTr: 'Kurumsal Plan',
    price: 8999,
    currency: 'TRY',
    duration: 1,
    features: [
      'Unlimited doctor profiles',
      'Unlimited appointments',
      'Custom reporting',
      '24/7 phone support',
      'All device access',
      'API access',
      'White-label solution',
      'Custom integrations',
      'Dedicated account manager',
      'Training sessions'
    ],
    featuresTr: [
      'Sınırsız doktor profili',
      'Sınırsız randevu',
      'Özel raporlama',
      '7/24 telefon desteği',
      'Tüm cihaz erişimi',
      'API erişimi',
      'White-label çözüm',
      'Özel entegrasyonlar',
      'Atanan müşteri temsilcisi',
      'Eğitim seansları'
    ]
  }
];

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Demo ödeme oluşturur
 * Gerçek ödeme yapılmaz, sadece simülasyon
 */
export async function createDemoPayment(
  req: DemoPaymentRequest,
  userId: string
): Promise<DemoPaymentResponse> {
  // Planı kontrol et
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === req.planId);
  if (!plan) {
    throw new Error('Geçersiz plan ID');
  }

  // Kart numarası validasyonu (basit)
  const cardNumber = req.cardNumber.replace(/\s/g, '');
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    throw new Error('Geçersiz kart numarası');
  }

  // CVV validasyonu
  if (req.cvv.length < 3 || req.cvv.length > 4) {
    throw new Error('Geçersiz CVV');
  }

  // Tarih validasyonu
  const [month, year] = req.expiryDate.split('/').map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    throw new Error('Kart süresi dolmuş');
  }

  // Demo - her zaman başarılı
  const transactionId = `DEMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date();

  // Ödeme kaydını database'e oluştur
  try {
    await prisma.payment.create({
      data: {
        paymentNo: `PAY-${Date.now()}`,
        userId,
        amount: plan.price,
        currency: plan.currency,
        status: 'COMPLETED',
        method: 'ONLINE',
        description: `${plan.nameTr} - ${plan.duration} aylık abonelik`,
        transactionId,
        paymentDate: timestamp
      }
    });
  } catch (error) {
    console.error('Payment database error:', error);
    // Demo olduğu için hata olsa bile devam et
  }

  return {
    success: true,
    transactionId,
    amount: plan.price,
    currency: plan.currency,
    message: `Demo ödeme başarılı! ${plan.nameTr} aktif.`,
    timestamp
  };
}

/**
 * Plan ID'sine göre fiyat döndürür
 */
export function getPlanAmount(planId: string): number {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  return plan?.price || 1499;
}

/**
 * Tüm planları döndürür
 */
export function getAllPlans(): SubscriptionPlan[] {
  return SUBSCRIPTION_PLANS;
}

/**
 * Plan ID'sine göre plan döndürür
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find(p => p.id === planId);
}

/**
 * Plan formatlı fiyat döndürür
 */
export function formatPrice(amount: number, currency: string = 'TRY'): string {
  if (currency === 'TRY') {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  }
  return `${amount} ${currency}`;
}

/**
 * Demo kart numaraları (test için)
 */
export const DEMO_CARDS = {
  success: {
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '123',
    holder: 'Demo User'
  },
  fail: {
    number: '4000 0000 0000 0002',
    expiry: '12/28',
    cvv: '123',
    holder: 'Demo User'
  }
};
