# LUMINEX - Mimari Dokümantasyonu

## 📋 İçindekiler

- [Sistem Genel Bakış](#sistem-genel-bakış)
- [Katmanlar](#katmanlar)
- [Veri Akış Diyagramları](#veri-akış-diyagramları)
- [Bileşenler ve İlişkiler](#bağlantılar-ve-ilişkiler)
- [Güvenlik Mimarisi](#güvenlik-mimarisi)
- [Performans Stratejileri](#performans-stratejileri)

---

## 🏗️ Sistem Genel Bakış

LUMINEX, **üç katmanlı** mimariye sahip Next.js 15 uygulamasıdır:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React Components (TSX)                                   │  │
│  │ - Pages (App Router)                                  │  │
│  │ - Client Components (Interactive)                      │  │
│  │ - CSS (mevcut tasarım korunur)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Server Components (RSC)                                   │  │
│  │ - API Routes (/api/*)                                 │  │
│  │ - Middleware (route protection)                        │  │
│  │ - Server Actions                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Prisma ORM (Type-Safe Database Access)                │  │
│  │ - Validation (Zod schemas)                            │  │
│  │ - Authentication (NextAuth.js)                         │  │
│  │ - Authorization (Role-based)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PostgreSQL Database                                     │  │
│  │ - Users, Doctors, Appointments, etc.                   │  │
│  │ - Relations, Indexes, Constraints                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧱 Katmanlar

### 1. Presentation Layer (UI)

```
┌─────────────────────────────────────────────────────────────┐
│  React Components (TSX)                                    │
│                                                             │
│  ├─ Layout Components                                    │
│  │  ├─ Navbar.tsx          - Header navigation            │
│  │  ├─ Footer.tsx          - Footer information          │
│  │  └─ Sidebar.tsx         - Side navigation (dashboard) │
│                                                             │
│  ├─ Feature Pages                                        │
│  │  ├─ Home (page.tsx)      - Landing page             │
│  │  ├─ Login             - Authentication           │
│  │  ├─ Register          - User registration        │
│  │  └─ Dashboard        - User dashboards          │
│                                                             │
│  └─ Client Components                                  │
│     ├─ Forms, Cards, Lists, Modals                     │
│     └─ Interactive UI elements                      │
└─────────────────────────────────────────────────────────────┘
```

**Tasarım:** %100 CSS korumudu, mevcut stiller aynen kullanılıyor

### 2. Application Layer (Next.js)

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router                                         │
│                                                             │
│  ├─ Server Components (RSC)                              │
│  │  - Asenkron data fetching                            │
│  │  - SEO optimization                                  │
│  │  - First paint optimization                          │
│                                                             │
│  ├─ API Routes (/api/*)                                  │
│  │  ├─ Authentication                                  │
│  │  ├─ Appointments                                   │
│  │  ├─ Doctors                                        │
│  │  ├─ Hospitals                                      │
│  │  └─ Notifications                                   │
│                                                             │
│  └─ Middleware                                           │
│     - Route protection                                 │
│     - License validation                               │
│     - Rate limiting                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3. Business Logic Layer

```
┌─────────────────────────────────────────────────────────────┐
│  Services & Libraries                                       │
│                                                             │
│  ├─ lib/auth.ts                                          │
│  │  - Authentication functions                           │
│  │  - Password hashing (bcrypt)                          │
│  │  - Session management                               │
│  │  - Token verification                             │
│                                                             │
│  ├─ lib/validations.ts                                   │
│  │  - Zod schemas                                     │
│  │  - Type-safe validation                              │
│  │  - Error formatting                                 │
│                                                             │
│  ├─ lib/translations.ts                                  │
│  │  - i18n (TR/EN)                                     │
│  │  - Translation keys                                  │
│  │  - Language switcher                                 │
│                                                             │
│  └─ lib/db.ts                                            │
│     - Prisma client singleton                       │
│     - Database connection                           │
└─────────────────────────────────────────────────────────────┘
```

### 4. Data Access Layer

```
┌─────────────────────────────────────────────────────────────┐
│  Prisma ORM                                                │
│                                                             │
│  Models:                                                    │
│  ├─ User, PatientProfile, DoctorProfile                   │
│  ├─ Hospital, Department                                  │
│  ├─ Appointment, Prescription                            │
│  ├─ Message, Notification                                │
│  ├─ Payment, Session                                     │
│  ├─ AuditLog, License                                    │
│  └─ BlockedSlot                                         │
│                                                             │
│  Features:                                                  │
│  ├─ Type-safe queries                                  │
│  ├─ Automatic migrations                                │
│  ├─ Relationship loading                                │
│  └─ Transaction support                                 │
└─────────────────────────────────────────────────────────────┘
```

### 5. Infrastructure Layer

```
┌─────────────────────────────────────────────────────────────┐
│  Deployment & Infrastructure                                │
│                                                             │
│  ├─ Docker (Containerization)                            │
│  │  - PostgreSQL container                               │
│  │  - Next.js application container                     │
│  │  │  ├─ Environment variables                       │
│  │  │  └─ Volume mounts (data persistence)           │
│  │                                                             │
│  ├─ Vercel (Cloud - Optional)                             │
│  │  - Edge deployment                                   │
│  │  - Automatic HTTPS                                    │
│  │  │  ├─ Automatic scaling                              │
│  │  │  └─ Global CDN                                   │
│  │                                                             │
│  └─ Self-Hosted (Docker Compose)                         │
│     - Domain license lock                                 │
│     - Customer-controlled server                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Veri Akış Diyagramları

### 1. Authentication Flow

```
┌─────────────┐      ┌──────────┐      ┌──────────────┐
│   Client    │──────│ Middleware│──────│  API Route   │
└─────┬───────┘      └─────┬────┘      └──────┬───────┘
      │                   │                   │
      │                   ▼                   ▼
      │              ┌─────────────┐       │
      │              │ NextAuth.js │       │
      │              └──────┬──────┘       │
      │                     │                │
      ▼                     ▼                ▼
┌─────────────┐      ┌──────────┐      ┌──────────────┐
│  Browser   │      │ Database │      │  JWT Token   │
└─────────────┘      └──────────┘      └──────────────┘
                         ▲
                         │
                    ┌─────────┐
                    │ Prisma  │
                    └─────────┘
```

### 2. Randevu Oluşturma Flow

```
┌──────────┐   ┌─────────┐   ┌──────────┐   ┌─────────┐
│  Kullanıcı│──→│ Form    │──→│ Zod      │──→│ API      │
│          │   │ Validate   │   │ Valid    │   │ Create   │
└──────────┘   └─────────┘   └──────────┘   └────┬───┘
                                                   │
                                    │
                              ┌───────────────┐
                              │ Prisma Query  │
                              │ - Check doctor │
                              │ - Check slot   │
                              │ - Create record│
                              └───────┬───────┘
                                      │
                           ┌──────────────────────┐
                           │ Database             │
                           │ - Appointment        │
                           │ - Notification        │
                           └──────────────────────┘
```

### 3. Middleware Route Protection

```
┌────────────────────────────────────────────────────────────┐
│                     REQUEST                                 │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌────────────────────────────────┐
              │          Middleware               │
              ├────────────────────────────────┤
              │ 1. Get session (NextAuth)          │
              │ 2. Check route type               │
              │ 3. Validate role                  │
              │ 4. Check license (production)     │
              └────────────────────────────────┘
                            │
                            ▼
              ┌────────────────────────────────┐
              │  ALLOW                    │
              │  ├─ Public: /, /login, /register │
              │  ├─ Patient: /dashboard        │
              │  ├─ Doctor: /doctor/*           │
              │  └─ Admin: /admin/*            │
              │  DENY                     │
              │  └─ Redirect to /login         │
              └────────────────────────────────┘
```

---

## 🔗 Bağlantılar ve İlişkiler

### Entity Relationship Diagram

```
┌─────────────┐
│     User     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────┐
│PatientProfile│    │DoctorProfile │
└─────────────┘    └──────────────┘
       │                  │
       │                  │
       │              ┌───┴───┐
       │              │       │
       ▼              ▼       ▼
┌─────────────┐ ┌───┴──────┴─────┐
│  Appointment│ │                 │
│              │ │     Hospital     │
│              │ │     Department   │
└─────────────┘ └─────────────────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌────────────────────────────┐
│     Prescription             │
└────────────────────────────┘
```

### Role-Based Access Control

```
┌─────────────────────────────────────────────────────┐
│                    USER ROLES                        │
├─────────────────────────────────────────────────────┤
│                                                       │
│  PATIENT (Hasta)                                     │
│  ├─ Dashboard görüntüle                           │
│  ├─ Randevu oluşturabilir                          │
│  ├─ Kendi randevularını iptal edebilir               │
│  ├─ Reçete ve tahlil sonuçlarını görebilir          │
│  └─ Mesaj gönderebilir                              │
│                                                       │
│  DOCTOR                                              │
│  ├─ Dashboard görüntüle                           │
│  ├─ Randevuları yönetir                             │
│  ├─ Randevu onaylayabilir/iptal edebilir           │
│  ├─ Reçete yazabilir                                │
│  ├─ Tahlil sonucu ekleyebilir                        │
│  ├─ Mesaj gönderebilir                              │
│  └─ Müsaitlik ayarlayabilir                         │
│                                                       │
│  ADMIN                                               │
│  ├─ Dashboard görüntüle                           │
│  ├─ Tüm kullanıcıları yönetebilir                     │
│  ├─ Hastane ve departman ekleyebilir                 │
│  ├─ Lisansları yönetebilir                          │
│  ├─ Sistem loglarını görüntüleyebilir                │
│  └─ Tüm veritabanına erişimi var                     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Güvenlik Mimarisi

### Kimlik Doğrulama

```typescript
// 1. Password Storage (Production)
// ✅ YAKIN: bcrypt (cost: 10)
// ❌ DEĞİL: Plaintext, MD5, SHA-256 (client-side)

// 2. Token Storage
// ✅ YAKIN: httpOnly cookie (XSS koruma)
// ❌ DEĞİL: localStorage, sessionStorage

// 3. Session Management
// ✅ YAKIN: Server-side session + JWT
// ❌ DEĞİL: Client-side state
```

### Yetkilendirme Modeli

```typescript
// Role-based Access Control (RBAC)

interface Permission {
  resource: string;      // 'appointments', 'users'
  action: string;        // 'create', 'read', 'update', 'delete'
  condition?: string;    // Ek koşullar
}

// Role -> Permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  PATIENT: [
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'create', condition: 'own' },
    { resource: 'appointments', action: 'delete', condition: 'own' },
  ],
  DOCTOR: [
    { resource: 'appointments', action: 'read' },
    { resource: 'appointments', action: 'update', condition: 'assigned' },
    { resource: 'prescriptions', action: 'create' },
  ],
  ADMIN: [
    { resource: '*', action: '*' }, // Full access
  ],
};
```

### Rate Limiting

```typescript
// API Rate Limiting

const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 100 istek
  message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
};

// Protected endpoints:
// - /api/auth/*
// - POST /api/appointments
// - POST /api/register
```

---

## ⚡ Performans Stratejileri

### 1. Code Splitting

```typescript
// Otomatik code splitting
import dynamic from 'next/dynamic';

// Component lazy loading
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-side only
});

// Sayfa bazlı yükleme
const AppointmentPage = dynamic(() => import('./appointment/page'));
```

### 2. Data Fetching

```typescript
// Server Component (RSC) - Prefetching
async function DashboardPage() {
  const data = await prisma.appointment.findMany();
  return <Dashboard appointments={data} />;
}

// Client Component - İste isteği
'use client';
function AppointmentForm() {
  const { data, error } = useSWR('/api/appointments');
}
```

### 3. Caching Strategies

```typescript
// API Response Caching
export const revalidate = 300; // 5 dakika

// ISR (Incremental Static Regeneration)
export async function generateStaticParams() {
  return [{ slug: 'kardiyoloji' }];
}
```

### 4. Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/images/hero-doctor.png"
  alt="Doktor"
  width={800}
  height={600}
  priority // LCP için önemli
  placeholder="blur" // Yüklenirken blur
/>
```

---

## 🔄 State Management

### Client State

```typescript
// React Context API - Basit state için

// 1. Theme State
interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Language State
interface LanguageState {
  language: 'tr' | 'en';
  setLanguage: (lang: 'string) => void;
}

// 3. Auth State (NextAuth)
interface AuthState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}
```

### Server State

```typescript
// Prisma - Veritabanın single source of truth

// Appointments
const appointments = await prisma.appointment.findMany({
  where: { patientId: user.id },
  include: { doctor: true },
});

// Real-time updates için:
// - Server Actions (mutations)
// - Polling (fallback)
// - WebSockets (gelecek)
```

---

## 🧩 Modülerlik

### Folder Structure by Feature

```
src/
├── app/                 # Routes (Next.js App Router)
├── components/          # UI components
│   ├── layout/           # Shared layouts
│   ├── auth/             # Auth components
│   ├── dashboard/       # Dashboard components
│   └── features/        # Feature components
├── lib/                 # Business logic
├── types/               # Type definitions
└── hooks/               # Custom React hooks

// Her feature bağımsız
→ /appointment → components/appointment/ + hooks/useAppointment.ts
→ /doctors → components/doctors/ + hooks/useDoctors.ts
```

---

## 📐 Scalling Strategy

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────┐
│                  Load Balancer                         │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┬──────────────┬──────────────┐
        │              │              │              │
    ┌───┴────┐      ┌───┴────┐      ┌───┴────┐      │
    │ Next.js│      │ Next.js│      │ Next.js│      │
    │ App 1 │      │ App 2 │      │ App 3 │      │
    └───────┘      └───────┘      └───────┘      │
        │              │              │              │
    ┌───┴──────────┴───┐ ┌───┴──────────┴───┐                │
    │  PostgreSQL (Primary) │  PostgreSQL (Read)  │
    └──────────────────────┘ └──────────────────────┘                │
                                                               │
                               ┌──────────────────┐
                               │  Redis Cache     │ (Optional)
                               └──────────────────┘
```

---

## 🛡️ Error Handling

### Client-Side

```typescript
// React Error Boundary
'use client';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    console.error('Error:', error);
    // Log error to service
    logErrorToService(error);
  }

  render() {
    return <ErrorFallback />;
  }
}
```

### Server-Side

```typescript
// API Error Handler
export class ApiError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Usage
throw new ApiError('USER_NOT_FOUND', 404, 'Kullanıcı bulunamadı');
```

---

## 📊 Monitoring Strategy

### Logging

```typescript
// Audit Log - Tüm işlemleri kaydet
await prisma.auditLog.create({
  userId: session.user.id,
  action: 'APPOINTMENT_CREATE',
  entityType: 'Appointment',
  entityId: appointment.id,
  description: 'Randevu oluşturuldu',
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
});
```

### Metrics

```
İzlenecek Metrikler:
- Response times (P50, P95, P99)
- Error rates (by endpoint, by type)
- Active users (DAU, MAU)
- API call volumes
- Database query performance
- Failed login attempts
- License validation failures
```

---

## 🔧 Configuration Management

### Environment Variables

```bash
# .env (Development)
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/luminex
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-min-32-characters

# .env.production (Production)
NODE_ENV=production
DATABASE_URL=${DATABASE_URL}
NEXTAUTH_URL=${NEXTAUTH_URL}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
LICENSE_DOMAIN=${LICENSE_DOMAIN}
```

### Config Schema

```typescript
// lib/config.ts
export const config = {
  app: {
    name: process.env.APP_NAME || 'LUMINEX',
    url: process.env.APP_URL || 'http://localhost:3000',
  },
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 gün
    bcryptRounds: 10,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 dakika
  },
  database: {
    connectionLimit: 10,
    poolTimeout: 60,
  },
  license: {
    validationInterval: 60 * 60 * 1000, // 1 saat
  },
};
```

---

## 🚀 Performance Targets

### Core Web Vitals

```
Metric          Target    Mevcut   Durum
───────────────────────────────────────
LCP             2.5s      ~1.2s    ✅ Better
FID             100ms     ~80ms    ✅ Better
CLS             0.1       ~0.05    ✅ Better
TTI             4s        ~2s       ✅ Better
SI              75%        ~90%     ✅ Better
```

### Bundle Size

```
Main Bundle:
- Initial JS: ~90KB (gzipped)
- CSS: ~150KB (gzipped, includes all styles)
- Fonts: ~50KB (auto-optimized)

Total: ~290KB initial load
```

---

## 📐 Database Design

### Indexing Strategy

```prisma
model Appointment {
  @@index([patientId])
  @@index([doctorId])
  @@index([appointmentDate])
  @@index([status])
  @@index([patientId, appointmentDate])
}
```

### Query Optimization

```typescript
// İlişkili veri fetching (N+1 problem çözümü)
const appointments = await prisma.appointment.findMany({
  where: { patientId: userId },
  include: {
    doctor: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    },
  },
});
```

---

## 🎯 Gelecek Yol

### Kısa Vadedeki İyileştirmeler

1. **Unit Tests** (1-2 gün)
   - Component tests
   - API route tests
   - Utility function tests

2. **E2E Tests** (2-3 gün)
   - Playwright tests
   - Critical user flows
   - Cross-browser testing

3. **Performance Audit** (1 gün)
   - Lighthouse CI
   - Bundle analyzer
   - Web Vitals monitoring

4. **Security Audit** (1 gün)
   - OWASP ZAP scan
   - Dependency check (npm audit)
   - Code vulnerability scan

5. **Production Deployment** (1 gün)
   - Docker compose test
   - Vercel deployment
   - SSL configuration

---

## 📞 Destek ve İletişim

### Dokümantasyon

```
Dahili dokümantasyon:
- ARCHITECTURE.md (bu dosya)
- API_DOCUMENTATION.md
- DEVELOPMENT.md
- DEPLOYMENT.md
- TROUBLESHOOTING.md
```

### Destek Kanalları

```
GitHub Issues: https://github.com/your-repo/luminex-next/issues
Slack: #luminex-dev
Email: dev@luminex.com.tr
```

---

*Dokümantasyon boyu: ~500 satır*
*Tahmini okuma süresi: 12-15 dakika*