# LUMINEX - Sorun Giderme Rehberi

## 📋 İçindekiler

- [Giriş](#giriş)
- [Kurulum Sorunları](#kurulum-sorunları)
- [Database Sorunları](#database-sorunları)
- [Build Sorunları](#build-sorunları)
- [Runtime Hataları](#runtime-hataları)
- [Performance Sorunları](#performance-sorunları)
- [Authentication Sorunları](#authentication-sorunları)
- [API Hataları](#api-hataları)
- [CSS/Styling Sorunları](#cssstyling-sorunları)
- [Deployment Sorunları](#deployment-sorunları)

---

## 🚨 Giriş

Bu rehber, LUMINEX projesinde karşılaşılan yaygın sorunların ve çözümlerinin bir derlemesidir.

### Hata Raporlama Formatı

Sorun bildirirken lütfen şu şablonu kullanın:

```markdown
## Sorun Açıklaması
Kısa açıklama

## Ortam
- Node.js versiyonu:
- İşletim sistemi:
- Tarayıcı:
- Node environment: (development/production)

## Adımlar
1. ...
2. ...

## Beklenen Davranış
...

## Gerçekleşen Davranış
...

## Ekran Görüntüsü
[Ekran görüntüsü]

## Console Logları
```
Log çıktısı buraya
```
```

---

## 🔧 Kurulum Sorunları

### Sorun: `npm install` başarısız oluyor

**Hata Mesajı:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Çözümler:**

1. **Cache'i temizle:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. **Legacy peer deps kullan:**
```bash
npm install --legacy-peer-deps
```

3. **Node.js versiyonunu kontrol et:**
```bash
node --version  # 20.x olmalı
nvm use 20  # veya nvm use 18
```

---

### Sorun: Prisma generate başarısız

**Hata Mesajı:**
```
Error: @prisma/client did not initialize yet
```

**Çözümler:**

1. **Prisma'ı yeniden oluştur:**
```bash
npx prisma generate
```

2. **Node_modules'i temizle:**
```bash
rm -rf node_modules
npm install
npx prisma generate
```

3. **Prisma Client versiyonunu kontrol et:**
```bash
npm list @prisma/client
npm list prisma
# Her ikisi de aynı versiyonda olmalı
```

---

### Sorun: TypeScript hataları

**Hata Mesajı:**
```
TS2307: Cannot find module '@/lib/auth'
```

**Çözümler:**

1. **tsconfig.json'ı kontrol et:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. **TypeScript sunucusunu yeniden başlat:**
```
VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
```

3. **Projeyi yeniden build et:**
```bash
rm -rf .next
npm run build
```

---

## 💾 Database Sorunları

### Sorun: Database bağlanamıyor

**Hata Mesajı:**
```
Can't reach database server at `localhost:5432`
```

**Çözümler:**

1. **PostgreSQL servisinin çalıştığını kontrol et:**
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
sc query postgresql-x64-14
```

2. **PostgreSQL'i başlat:**
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start postgresql-x64-14
```

3. **Bağlantı string'ini kontrol et:**
```env
# .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/luminex?schema=public"
```

4. **Port'un kullanımda olup olmadığını kontrol et:**
```bash
# macOS/Linux
lsof -i :5432

# Windows
netstat -an | findstr :5432
```

---

### Sorun: Migration hatası

**Hata Mesajı:**
```
Migration failed: P3006
Migration `xxx` failed to apply cleanly
```

**Çözümler:**

1. **Migration durumunu kontrol et:**
```bash
npx prisma migrate status
```

2. **Migration'ı resolve et:**
```bash
npx prisma migrate resolve --applied "migration_name"
```

3. **Son migration'ı rollback et:**
```bash
npx prisma migrate resolve --rolled-back "migration_name"
```

4. **Tüm migration'ları reset et (DİKKAT: Veri siler):**
```bash
npx prisma migrate reset --force
```

---

### Sorun: Foreign key constraint hatası

**Hata Mesajı:**
```
Foreign key constraint failed on the field: `appointment_doctorId_fkey`
```

**Çözümler:**

1. **Önce parent kaydı oluştur:**
```typescript
// ❌ YANLIŞ
await prisma.appointment.create({
  data: {
    doctorId: 'non-existent-id',
    // ...
  },
});

// ✅ DOĞRU
const doctor = await prisma.doctorProfile.create({ /* ... */ });
await prisma.appointment.create({
  data: {
    doctorId: doctor.id,
    // ...
  },
});
```

2. **Cascade delete kontrol et:**
```prisma
// schema.prisma
model Appointment {
  doctor   DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
}
```

---

### Sorun: Seed data çalışmıyor

**Hata Mesajı:**
```
Error: Unique constraint failed on the fields: (`email`)
```

**Çözümler:**

1. **Database'i temizle:**
```bash
npx prisma migrate reset --force
npm run db:seed
```

2. **Seed script'te upsert kullan:**
```typescript
// seed.ts
await prisma.user.upsert({
  where: { email: 'admin@luminex.com' },
  update: {},
  create: { /* ... */ },
});
```

---

## 🏗️ Build Sorunları

### Sorun: Build başarısız oluyor

**Hata Mesajı:**
```
Error: Build failed with code 1
```

**Çözümler:**

1. **Next.js cache'ini temizle:**
```bash
rm -rf .next
npm run build
```

2. **TypeScript hatalarını kontrol et:**
```bash
npx tsc --noEmit
```

3. **Environment variables'ı kontrol et:**
```bash
# .env.production dosyasının varlığından emin ol
ls -la .env*
```

4. **Production build için environment export:**
```bash
NODE_ENV=production npm run build
```

---

### Sorun: Turbopack hatası

**Hata Mesajı:**
```
Error: Turbopack build failed
```

**Çözümler:**

1. **Webpack'e geç (next.config.ts):**
```typescript
const nextConfig = {
  // turbopack: {},  // Bunu yorum satırı yap
};
```

2. **Veya Turbopack'i disable et:**
```bash
npm run dev -- --no-turbopack
```

---

## 🚨 Runtime Hataları

### Sorun: 500 Internal Server Error

**Hata Mesajı:**
```
Internal Server Error
```

**Çözümler:**

1. **Server loglarını kontrol et:**
```bash
# Terminalde (dev mode)
npm run dev

# Production'da
docker compose logs -f app
```

2. **Console.log ile debug et:**
```typescript
// API route
export async function POST(request: NextRequest) {
  try {
    console.log('Request body:', await request.clone().json());
    // ...
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
```

3. **Stack trace'i görüntüle:**
```typescript
console.error(error.stack);
```

---

### Sorun: Hydration failed

**Hata Mesajı:**
```
Error: Hydration failed because the initial UI does not match what was rendered on the server
```

**Çözümler:**

1. **Client ve server arasındaki farkı kontrol et:**
```tsx
// ❌ YANLIŞ - Server'da farklı sonuç
export function UserProfile() {
  const date = new Date().toString(); // Server ve client'ta farklı
  return <div>{date}</div>;
}

// ✅ DOĞRU - useEffect ile client-side
'use client';
export function UserProfile() {
  const [date, setDate] = useState('');

  useEffect(() => {
    setDate(new Date().toString());
  }, []);

  return <div>{date}</div>;
}
```

2. **localStorage/sessionStorage kullanımı:**
```tsx
// ❌ YANLIŞ - SSR'de hata verir
export function ThemeToggle() {
  const theme = localStorage.getItem('theme'); // Server'da localStorage yok
  return <div>{theme}</div>;
}

// ✅ DOĞRU - useEffect ile
'use client';
export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light');
  }, []);

  return <div>{theme}</div>;
}
```

---

### Sorun: Cannot read property of undefined

**Hata Mesajı:**
```
TypeError: Cannot read properties of undefined (reading 'firstName')
```

**Çözümler:**

1. **Optional chaining kullan:**
```tsx
// ❌ YANLIŞ
<div>{user.firstName}</div>  // user undefined olabilir

// ✅ DOĞRU
<div>{user?.firstName}</div>

// Veya
<div>{user?.firstName || 'Misafir'}</div>
```

2. **Default değer ile:**
```tsx
const userName = user?.firstName ?? 'Misafir';
```

3. **Null check:**
```tsx
{user && <div>{user.firstName}</div>}
```

---

## ⚡ Performance Sorunları

### Sorun: Sayfa yükleme yavaş

**Semptomlar:**
- İlk yükleme > 5 saniye
- LCP (Largest Contentful Paint) > 2.5 saniye

**Çözümler:**

1. **Next.js Image kullan:**
```tsx
import Image from 'next/image';

<Image
  src="/doctor.jpg"
  alt="Doctor"
  width={400}
  height={300}
  priority // LCP image için
/>
```

2. **Code splitting:**
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>Yükleniyor...</div>,
  ssr: false, // Sadece client-side render
});
```

3. **Veri fetching'i optimize et:**
```typescript
// ❌ YANLIŞ - Sequential
const user = await prisma.user.findUnique({ where: { id } });
const appointments = await prisma.appointment.findMany({
  where: { patientId: id },
});

// ✅ DOĞRU - Parallel
const [user, appointments] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.appointment.findMany({ where: { patientId: id } }),
]);
```

4. **Pagination kullan:**
```typescript
const appointments = await prisma.appointment.findMany({
  take: 10,
  skip: (page - 1) * 10,
});
```

---

### Sorun: Database sorguları yavaş

**Semptomlar:**
- API cevap süresi > 2 saniye
- Database loglarında yavaş sorgular

**Çözümler:**

1. **Index ekle:**
```prisma
// schema.prisma
model Appointment {
  id        String   @id @default(cuid())
  patientId String
  doctorId  String

  @@index([patientId])
  @@index([doctorId])
  @@index([appointmentDate, status])
}
```

2. **Sadece gerekli alanları select et:**
```typescript
// ❌ YANLIŞ - Tüm alanlar
const appointments = await prisma.appointment.findMany({
  include: { patient: { include: { user: true } } },
});

// ✅ DOĞRU - Selective
const appointments = await prisma.appointment.findMany({
  select: {
    id: true,
    appointmentDate: true,
    patient: {
      select: {
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
```

3. **Prisma middleware ile log:**
```typescript
// lib/db.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

---

## 🔐 Authentication Sorunları

### Sorun: Login olunamıyor

**Semptomlar:**
- "Invalid credentials" hatası
- Redirect döngüsü

**Çözümler:**

1. **NEXTAUTH_SECRET kontrol et:**
```env
# .env.local
# En az 32 karakter olmalı
NEXTAUTH_SECRET="minimum-32-character-random-string-here"
```

2. **NEXTAUTH_URL kontrol et:**
```env
# Development
NEXTAUTH_URL="http://localhost:3000"

# Production
NEXTAUTH_URL="https://yourdomain.com"
```

3. **Database'de user kontrol et:**
```bash
npx prisma studio
# Users tablosunu kontrol et
```

4. **Password hash kontrol et:**
```typescript
// Test için
const hash = await bcrypt.hash('test123', 10);
const match = await bcrypt.compare('test123', user.password);
console.log('Password match:', match);
```

---

### Sorun: Session kayboluyor

**Semptomlar:**
- Page refresh'te session gidiyor
- Kullanıcı sürekli login sayfasına yönlendiriliyor

**Çözümler:**

1. **Cookie configuration kontrol et:**
```typescript
// lib/auth.ts
export const { handlers, auth } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
});
```

2. **Middleware kontrol et:**
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 🌐 API Hataları

### Sorun: 404 Not Found

**Semptomlar:**
- API endpoint'leri cevap vermiyor
- Route bulunamıyor

**Çözümler:**

1. **Route dosyasının konumunu kontrol et:**
```
✅ DOĞRU: src/app/api/appointments/route.ts
❌ YANLIŞ: src/app/api/appointment/index.ts
```

2. **Export edilen metodları kontrol et:**
```typescript
// route.ts
export async function GET(request: NextRequest) { }  // ✅
export async function POST(request: NextRequest) { } // ✅

// get function (lowercase) çalışmaz ❌
export async function get(request: NextRequest) { }
```

3. **File extension kontrol et:**
```
✅ route.ts  (TypeScript)
✅ route.js  (JavaScript)
❌ route.tsx (Component için)
```

---

### Sorun: CORS hatası

**Hata Mesajı:**
```
Access to fetch at 'http://localhost:3000/api' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

**Çözümler:**

1. **Same-origin kullan (önerilen):**
```typescript
// API çağrısında origin belirtme
const response = await fetch('/api/appointments');  // ✅

// Bunun yerine:
const response = await fetch('http://localhost:3000/api/appointments'); // ❌
```

2. **CORS package kullan (gerekirse):**
```bash
npm install nextjs-cors
```

```typescript
// middleware.ts
import { cors } from 'nextjs-cors';

export async function middleware(request: Request) {
  await cors(request);
  // ...
}
```

---

## 🎨 CSS/Styling Sorunları

### Sorun: Stiller yüklenmiyor

**Semptomlar:**
- Sayfa düz görünüyor
- CSS class'ları çalışmıyor

**Çözümler:**

1. **CSS import kontrol et:**
```typescript
// app/globals.css
@import url('/styles/landing.css');
@import url('/styles/dark-mode.css');
@import url('/styles/style.css');

// app/layout.tsx
import './globals.css';  // ✅ Import edilmeli
```

2. **Public klasör kontrol et:**
```
public/
  styles/
    landing.css      ✅
    dark-mode.css    ✅
    style.css        ✅
```

3. **Tailwind conflict (kullanıyorsan):**
```css
/* globals.css */
@tailwind base;    /* Bu satırlar mevcut CSS'i override edebilir */
@tailwind components;
@tailwind utilities;

/* Çözüm: Tailwind'i kaldır veya mevcut CSS'ten ayır */
```

---

### Sorun: Dark mode çalışmıyor

**Semptomlar:**
- Dark mode toggle çalışmıyor
- Tema değişmiyor

**Çözümler:**

1. **Provider kontrol et:**
```tsx
// app/layout.tsx
import { ThemeProvider } from '@/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>{children}</ThemeProvider>  {/* ✅ */}
      </body>
    </html>
  );
}
```

2. **localStorage kontrol et:**
```typescript
// Dark mode kaydediliyor mu?
useEffect(() => {
  localStorage.setItem('theme', 'dark');
}, []);
```

3. **CSS class'ları kontrol et:**
```css
/* dark-mode.css */
body.dark-mode {
  background-color: #1a1a1a;
  color: #ffffff;
}

/* Class'ın uygulandığından emin ol */
```

---

## 🚀 Deployment Sorunları

### Sorun: Docker container başlamıyor

**Hata Mesajı:**
```
Error: Container exited with code 1
```

**Çözümler:**

1. **Logları kontrol et:**
```bash
docker compose logs app
```

2. **Environment variables kontrol et:**
```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}  # ✅ .env'den okunur
```

3. **Build context kontrol et:**
```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile  # ✅ Dockerfile mevcut dizinde olmalı
```

4. **Port conflict kontrol et:**
```bash
netstat -tuln | grep 3000
```

---

### Sorun: Vercel deployment hatası

**Hata Mesajı:**
```
Error: Build failed
```

**Çözümler:**

1. **Environment variables'ı kontrol et:**
```bash
# Vercel dashboard'da tanımlı olmalı
vercel env ls
```

2. **Build script'i kontrol et:**
```json
{
  "scripts": {
    "build": "prisma generate && next build"  // ✅ Prisma generate gerekli
  }
}
```

3. **Postgres connection kontrol et:**
```bash
# Vercel için direct URL kullan
DATABASE_URL_DIRECT="postgresql://..."
```

---

## 📞 Destek

Sorununuz burada çözülemezse:

1. **Logları topla:**
   - Browser console
   - Server logs
   - Error stack traces

2. **Environment bilgisi:**
   - Node.js version
   - OS version
   - Browser version

3. **İletişim:**
   - GitHub Issues: https://github.com/your-repo/issues
   - Email: support@luminex.com

---

## 🔍 Hızlı Tanı Aracı

Sorunu hızlıca tanımlamak için:

```bash
# 1. Environment kontrol
node --version
npm --version

# 2. Database kontrol
npx prisma migrate status

# 3. Build kontrol
npm run build

# 4. Type kontrol
npx tsc --noEmit

# 5. Lint kontrol
npm run lint

# 6. Port kontrol
netstat -tuln | grep 3000

# 7. Docker kontrol
docker ps -a
docker compose logs
```

---

*Sorun Giderme Rehberi boyu: ~450 satır*
*Son güncelleme: 8 Şubat 2025*
