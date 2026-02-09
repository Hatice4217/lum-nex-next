# LUMINEX - Geliştirme Rehberi

## 📋 İçindekiler

- [Giriş](#giriş)
- [Proje Yapısı](#proje-yapısı)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Kodlama Standartları](#kodlama-standartları)
- [Özellik Geliştirme Süreci](#özellik-geliştirme-süreci)
- [Test Stratejisi](#test-stratejisi)
- [Debug Teknikleri](#debug-teknikleri)
- [Performans İyileştirme](#performans-iyileştirme)
- [Güvenlik En İyi Uygulamaları](#güvenlik-en-iyi-uygulamaları)
- [Yardımcı Komutlar](#yardımcı-komutlar)

---

## 🎯 Giriş

Bu rehber, LUMINEX projesine katkıda bulunmak ve yeni özellikler geliştirmek için gereken bilgileri içerir.

### Ön Koşullar

```bash
# Gerekli yazılımlar
- Node.js 20.x (LTS)
- npm 10.x veya pnpm 8.x
- Git 2.x
- PostgreSQL 14+ (yerel geliştirme için)
- VS Code veya JetBrains WebStorm
- Docker Desktop (opsiyonel)
```

---

## 📁 Proje Yapısı

### Dizin Ağacı

```
luminex-next/
├── prisma/
│   ├── schema.prisma          # Database şeması
│   ├── seed.ts                # Örnek veri
│   └── migrations/            # Migration geçmişi
├── public/
│   ├── styles/                # Mevcut CSS dosyaları
│   ├── images/                # Görseller
│   └── icons/                 # İkonlar
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth route group
│   │   ├── (dashboard)/       # Dashboard route group
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Hasta dashboard
│   │   ├── doctor/            # Doktor sayfaları
│   │   ├── admin/             # Admin sayfaları
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Ana sayfa
│   ├── components/
│   │   ├── layout/            # Layout component'leri
│   │   ├── dashboard/         # Dashboard component'leri
│   │   ├── auth/              # Auth component'leri
│   │   └── ui/                # UI component'leri
│   ├── lib/
│   │   ├── auth.ts            # NextAuth yapılandırması
│   │   ├── db.ts              # Prisma client
│   │   ├── validations.ts     # Zod şemaları
│   │   ├── translations.ts    # i18n çevirileri
│   │   └── utils.ts           # Yardımcı fonksiyonlar
│   ├── middleware.ts          # Route protection
│   └── providers.tsx          # React providers
├── docs/                      # Dokümantasyon
├── .env.example               # Environment template
├── next.config.ts             # Next.js yapılandırması
├── package.json               # Dependecy'ler
├── tsconfig.json              # TypeScript yapılandırması
└── README.md                  # Proje bilgisi
```

### Dosya İsimlendirme Kuralları

| Tür | Kural | Örnek |
|-----|-------|-------|
| Page | `kebab-case` | `doctor-profile.tsx` |
| Component | `PascalCase` | `AppointmentCard.tsx` |
| Util/Hook | `camelCase` | `useAuth.ts` |
| API Route | `kebab-case` | `api/appointments/route.ts` |
| CSS Modül | `kebab-case.module.css` | `dashboard.module.css` |

---

## 🛠️ Geliştirme Ortamı Kurulumu

### 1. Projeyi Klonlama

```bash
git clone https://github.com/your-repo/luminex-next.git
cd luminex-next
```

### 2. Dependecy'leri Yükleme

```bash
# npm kullanıyorsanız
npm install

# pnpm kullanıyorsanız (daha hızlı)
pnpm install

# yarn kullanıyorsanız
yarn install
```

### 3. Environment Variables

```bash
# .env.example dosyasını kopyala
cp .env.example .env.local

# .env.local dosyasını düzenle
nano .env.local
```

```env
# .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/luminex?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-change-in-production"
```

### 4. Database Kurulumu

```bash
# Prisma'ı oluştur
npx prisma generate

# Migration'ları çalıştır
npx prisma migrate dev

# Seed data'yı yükle
npm run db:seed
```

### 5. Geliştirme Sunucusunu Başlatma

```bash
npm run dev
# http://localhost:3000 adresinde aç
```

---

## 📏 Kodlama Standartları

### TypeScript Konfigürasyonu

```json
// tsconfig.json - Strict mode aktif
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### ESLint Kuralları

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Prettier Yapılandırması

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Component Yazım Standartı

```typescript
// ✅ DOĞRU - Server Component (default)
export default async function DoctorList({ searchParams }: PageProps) {
  const doctors = await prisma.doctorProfile.findMany();
  return <div>...</div>;
}

// ✅ DOĞRU - Client Component (gerekirse)
'use client';

export function AppointmentForm({ onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  return <form>...</form>;
}

// ❌ YANLIŞ - Unnecessary client component
'use client';

export function StaticHeader() {
  return <header>LUMINEX</header>;
}
```

### İsimlendirme Kuralları

```typescript
// Component: PascalCase
export function AppointmentCard() {}
export const StatCard = () => {};

// Function/Hook: camelCase
export function formatAppointmentDate() {}
export function useAuth() {}

// Constant: UPPER_SNAKE_CASE
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
export const API_BASE_URL = '/api';

// Interface/Type: PascalCase
export interface AppointmentData {}
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

// Enum: PascalCase
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
```

---

## 🔄 Özellik Geliştirme Süreci

### 1. Planlama

```bash
# Yeni özellik için branch oluştur
git checkout -b feature/doctor-availability

# veya bug fix için
git checkout -b fix/login-error
```

### 2. Database Değişikliği (Gerekirse)

```bash
# Yeni migration oluştur
npx prisma migrate dev --name add_doctor_availability

# Schema güncellemesi
# prisma/schema.prisma'yi düzenle
```

### 3. Validation Ekleme

```typescript
// src/lib/validations.ts
export const availabilitySchema = z.object({
  doctorId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});
```

### 4. API Route Oluşturma

```typescript
// src/app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { availabilitySchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const body = await request.json();
  const result = availabilitySchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', details: result.error } },
      { status: 400 }
    );
  }

  // Business logic...

  return NextResponse.json({ success: true, data: result });
}
```

### 5. Component/View Oluşturma

```typescript
// src/app/doctor/availability/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AvailabilityManager } from '@/components/doctor/AvailabilityManager';

export default async function AvailabilityPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'DOCTOR') {
    redirect('/dashboard');
  }

  const availability = await prisma.availability.findMany({
    where: { doctor: { userId: session.user.id } },
  });

  return <AvailabilityManager initialData={availability} />;
}
```

### 6. Test Etme

```bash
# Unit testler
npm test

# E2E testler (Playwright)
npm run test:e2e

# Manual test
# http://localhost:3000/doctor/availability
```

### 7. Commit ve Push

```bash
git add .
git commit -m "feat: add doctor availability management

- Add availability CRUD API
- Add availability manager UI
- Add validation for time slots

Closes #123"
git push origin feature/doctor-availability
```

### 8. Pull Request

1. GitHub'da PR oluştur
2. Description template'i doldur
3. Code review iste
4. Approve ve merge

---

## 🧪 Test Stratejisi

### Unit Tests (Jest)

```typescript
// __tests__/lib/validations.test.ts
import { appointmentSchema } from '@/lib/validations';

describe('Appointment Validation', () => {
  it('should validate valid appointment data', () => {
    const data = {
      doctorId: 'clx123',
      appointmentDate: '2025-02-15',
      startTime: '10:00',
      endTime: '10:30',
    };
    const result = appointmentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject invalid time range', () => {
    const data = {
      doctorId: 'clx123',
      appointmentDate: '2025-02-15',
      startTime: '10:30',
      endTime: '10:00', // End before start
    };
    const result = appointmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

```typescript
// __tests__/api/appointments.test.ts
import { POST } from '@/app/api/appointments/route';

describe('Appointments API', () => {
  it('should create appointment', async () => {
    const request = new Request('http://localhost:3000/api/appointments', {
      method: 'POST',
      body: JSON.stringify({ doctorId: '...', ... }),
      headers: { cookie: 'session=...' },
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/appointment.spec.ts
import { test, expect } from '@playwright/test';

test('user can create appointment', async ({ page }) => {
  await page.goto('/appointment');
  await page.selectOption('doctorId', 'Dr. Mehmet Kaya');
  await page.fill('input[name="date"]', '2025-02-15');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 🐛 Debug Teknikleri

### Console Debugging

```typescript
// Server component'te console.log
export default async function DashboardPage() {
  const session = await auth();
  console.log('Session:', session); // Terminal'de görünür
  return <div>...</div>;
}

// Client component'te console.log
'use client';
export function AppointmentCard() {
  console.log('Appointment rendered'); // Browser console'da görünür
  return <div>...</div>;
}
```

### React DevTools

```typescript
// İsimlendirme için displayName
export function StatCard({ label, value }: Props) {
  // ...
}
StatCard.displayName = 'StatCard';
```

### Next.js Debug Mode

```bash
# Debug mode'da başlat
NODE_OPTIONS='--inspect' npm run dev

# Chrome'da chrome://inspect aç
# "Configure" butonuna tıkla
# localhost:9229 ekle
```

### Database Debug

```typescript
// Prisma logları aç
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Veya sadece query'leri gör
const prisma = new PrismaClient({
  log: ['query'],
});
```

---

## ⚡ Performans İyileştirme

### 1. Server Component Kullanımı

```typescript
// ✅ DOĞRU - Server component (varsayılan)
export default async function DoctorList() {
  const doctors = await prisma.doctorProfile.findMany(); // Direct DB access
  return <div>{/* ... */}</div>;
}

// ❌ YANLIŞ - Gereksiz client component
'use client';
export default function DoctorList() {
  const [doctors, setDoctors] = useState([]); // Unnecessary state
  useEffect(() => {
    fetch('/api/doctors').then(r => r.json()).then(setDoctors); // Unnecessary fetch
  }, []);
  return <div>{/* ... */}</div>;
}
```

### 2. Veri Getirme Optimizasyonu

```typescript
// ✅ DOĞRU - Parallel fetching
const [user, appointments, stats] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.appointment.findMany({ where: { patientId: id } }),
  prisma.appointment.groupBy({ by: ['status'] }),
]);

// ❌ YANLIŞ - Sequential fetching
const user = await prisma.user.findUnique({ where: { id } });
const appointments = await prisma.appointment.findMany({ where: { patientId: id } });
const stats = await prisma.appointment.groupBy({ by: ['status'] });
```

### 3. Selective Field Selection

```typescript
// ✅ DOĞRU - Sadece gerekli alanlar
const appointments = await prisma.appointment.findMany({
  select: {
    id: true,
    appointmentDate: true,
    status: true,
    doctor: {
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  },
});

// ❌ YANLIŞ - Tüm alanlar (potansiyel huge data)
const appointments = await prisma.appointment.findMany({
  include: { doctor: { include: { user: true } } },
});
```

### 4. Pagination

```typescript
// ✅ DOĞRU - Paginated
const page = parseInt(searchParams.page || '1');
const perPage = 10;

const [appointments, total] = await Promise.all([
  prisma.appointment.findMany({
    skip: (page - 1) * perPage,
    take: perPage,
  }),
  prisma.appointment.count(),
]);

return {
  data: appointments,
  meta: {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
  },
};
```

### 5. Caching

```typescript
// Next.js cache kullanımı
export async function getDoctors() {
  const doctors = await prisma.doctorProfile.findMany({
    cacheStrategy: { ttl: 60 }, // 60 saniye cache
  });
  return doctors;
}
```

### 6. Image Optimization

```tsx
import Image from 'next/image';

// ✅ DOĞRU - Next.js Image
<Image
  src="/doctors/dr-mehmet.jpg"
  alt="Dr. Mehmet Kaya"
  width={200}
  height={200}
  priority // LCP image için
/>

// ❌ YANLIŞ - HTML img
<img src="/doctors/dr-mehmet.jpg" alt="Dr. Mehmet Kaya" />
```

---

## 🔒 Güvenlik En İyi Uygulamaları

### 1. Input Validation

```typescript
// Her zaman Zod kullan
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = appointmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }
  // ...
}
```

### 2. Authorization Check

```typescript
// Her endpoint'te yetki kontrolü
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    );
  }

  const { id } = await params;

  // Kullanıcının bu kaydı silme yetkisi var mı?
  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (appointment.patientId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN' } },
      { status: 403 }
    );
  }
  // ...
}
```

### 3. SQL Injection Önleme

```typescript
// ✅ DOĞRU - Prisma kullan (otomatik koruma)
const users = await prisma.user.findMany({
  where: {
    email: userInput, // Prisma otomatik sanitize eder
  },
});

// ❌ YANLIŞ - Raw SQL kullanımı
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`; // Dikkat: parameterized query kullan
```

### 4. XSS Önleme

```tsx
// ✅ DOĞRU - React otomatik escape eder
<div>{userInput}</div>

// ⚠️ DİKKAT - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // XSS riski

// Eğer gerekirse sanitize et
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 5. CSRF Koruma

```typescript
// NextAuth otomatik CSRF token sağlar
// Formlarda kullan:
<form method="POST" action="/api/appointments">
  <input type="hidden" name="csrfToken" value={csrfToken} />
  {/* ... */}
</form>
```

### 6. Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}

// API route'ta kullan
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const session = await auth();
  const allowed = await checkRateLimit(session?.user?.id || request.ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  // ...
}
```

---

## 📝 Commit Mesajı Standartı

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Türler (Types)

| Type | Açıklama | Örnek |
|------|----------|-------|
| `feat` | Yeni özellik | `feat(appointments): add cancellation feature` |
| `fix` | Bug fix | `fix(auth): resolve login redirect loop` |
| `docs` | Dokümantasyon | `docs(readme): update setup instructions` |
| `style` | Kod stili (formatting) | `style(components): fix indentation` |
| `refactor` | Refactoring | `refactor(db): extract repository layer` |
| `perf` | Performans iyileştirmesi | `perf(dashboard): optimize data fetching` |
| `test` | Test | `test(auth): add unit tests for login` |
| `chore` | Build/process | `chore(deps): update nextjs to v15` |

### Örnek Commit Mesajları

```bash
# Basit feat
git commit -m "feat(doctors): add search functionality"

# Detaylı feat
git commit -m "feat(appointments): implement recurring appointments

- Add recurring pattern selection
- Create series of appointments
- Send confirmation emails

Closes #456"

# Bug fix
git commit -m "fix(auth): resolve session persistence issue

Session was lost on page refresh due to incorrect
cookie configuration. Fixed by updating NEXTAUTH_*
environment variables.

Fixes #123"
```

---

## 🔗 Yardımcı Komutlar

### NPM Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force"
  }
}
```

### Git Aliases

```bash
# .gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --oneline --all --decorate
```

### VS Code Snippets

```json
// .vscode/typescript.json
{
  "Server Component": {
    "prefix": "rsc",
    "body": [
      "export default async function ${1:ComponentName}() {",
      "  return <div>${2:Content}</div>;",
      "}"
    ]
  },
  "Client Component": {
    "prefix": "rcc",
    "body": [
      "'use client';",
      "",
      "export function ${1:ComponentName}() {",
      "  return <div>${2:Content}</div>;",
      "}"
    ]
  },
  "API Route": {
    "prefix": "api",
    "body": [
      "import { NextRequest, NextResponse } from 'next/server';",
      "import { auth } from '@/lib/auth';",
      "",
      "export async function ${1:POST}(request: NextRequest) {",
      "  const session = await auth();",
      "  ${2:// logic}",
      "  return NextResponse.json({ success: true });",
      "}"
    ]
  }
}
```

---

## 📚 Kaynaklar

### Resmi Dokümantasyon

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://authjs.dev)
- [Zod Docs](https://zod.dev)
- [React Docs](https://react.dev)

### Topluluk

- [Next.js GitHub](https://github.com/vercel/next.js)
- [Prisma GitHub](https://github.com/prisma/prisma)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

*Geliştirme Rehberi boyu: ~500 satır*
*Son güncelleme: 8 Şubat 2025*
