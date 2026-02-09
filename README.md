# LUMINEX - Sağlık Randevu Sistemi

> Next.js 15 + TypeScript + PostgreSQL + Prisma ile geliştirilmiş modern sağlık randevu platformu

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Kurulum](#-kurulum)
- [Proje Yapısı](#-proje-yapısı)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Geliştirme](#-geliştirme)
- [Deployment](#-deployment)

---

## ✨ Özellikler

### Kullanıcılar İçin
- 🏥 **Hasta Portalı**: Randevu oluşturma, geçmiş görüntüleme, reçete yönetimi
- 👨‍⚕️ **Doktor Portalı**: Randevu yönetimi, hasta görüntüleme, müsaitlik ayarlama
- 🔐 **Güvenli Kimlik Doğrulama**: NextAuth.js ile JWT tabanlı authentication
- 💬 **Mesajlaşma**: Hasta-doktor arasında güvenli iletişim
- 🔔 **Bildirimler**: Randevu hatırlatmaları ve güncellemeler
- 🌙 **Dark Mode**: Göz yormayan tema desteği
- 🌍 **Çoklu Dil**: Türkçe ve İngilizce dil desteği

### Yöneticiler İçin
- 👥 **Kullanıcı Yönetimi**: Hasta, doktor ve admin hesaplarını yönetme
- 🏥 **Hastane Yönetimi**: Hastane ve departman ekleme/düzenleme
- 📊 **Denetim Kayıtları**: Tüm işlemlerin logları
- 🔑 **Lisanslama**: Domain tabanlı lisans kontrolü

---

## 🚀 Teknoloji Yığını

### Frontend
- **Next.js 15.1** - React framework (App Router)
- **TypeScript** - Tip güvenliği
- **React 18** - UI library

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma** - ORM
- **PostgreSQL** - Veritabanı
- **NextAuth.js v5** - Authentication

### Güvenlik
- **bcryptjs** - Şifre hashleme
- **Zod** - Validasyon
- **JWT** - Token-based auth

---

## 📦 Kurulum

### Gereksinimler

- Node.js 20+
- PostgreSQL 14+
- npm veya yarn

### Adım 1: Bağımlılıkları Yükleyin

```bash
npm install
```

### Adım 2: Ortam Değişkenlerini Ayarlayın

`.env` dosyasını oluşturun:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/luminex?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-characters"
```

### Adım 3: Veritabanını Başlatın

```bash
# Prisma client'ı oluşturun
npm run db:generate

# Migration'ı çalıştırın
npm run db:migrate

# Seed verilerini yükleyin (opsiyonel)
npm run db:seed
```

### Adım 4: Uygulamayı Başlatın

```bash
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresini açın.

---

## 📁 Proje Yapısı

```
luminex-next/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   └── seed.ts                # Örnek veriler
├── public/
│   └── styles/                # CSS dosyaları (mevcut tasarım)
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/           # React components
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript types
│   └── middleware.ts         # Next.js middleware
├── docker-compose.yml        # Production Docker
└── package.json
```

---

## 👥 Test Kullanıcıları

Seed script çalıştırıldıktan sonra şu kullanıcılar oluşturulur:

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@luminex.com | admin123 |
| Hasta | ahmet.yilmaz@example.com | patient123 |
| Doktor | dr.mehmet.kaya@example.com | doctor123 |

---

## 📡 API Dokümantasyonu

### Authentication

#### POST /api/auth/register
Yeni kullanıcı kaydı oluşturur.

#### POST /api/auth/forgot-password
Şifre sıfırlama bağlantısı gönderir.

### Appointments

#### GET /api/appointments
Randevu listesini getirir.

#### POST /api/appointments
Yeni randevu oluşturur.

### Doctors

#### GET /api/doctors
Doktor listesini getirir (filtreleme ile).

#### GET /api/doctors/[id]
Doktor detaylarını getirir.

---

## 🛠️ Geliştirme

### Mevcut Scriptler

```bash
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production start
npm run db:generate  # Prisma client
npm run db:migrate   # Database migration
npm run db:seed      # Seed data
```

---

## 🐳 Docker Deployment

```bash
# Production
docker-compose up -d

# Development
docker-compose -f docker-compose.dev.yml up
```

---

## 🔒 Güvenlik

- ✅ **bcryptjs** - Şifreler hashlenir
- ✅ **JWT** - Token-based authentication
- ✅ **Domain Lisans** - Lisans kontrolü

---

## 📄 Lisans

Bu proje ticari kullanım içindir.

---

## 📞 İletişim

- **Email**: info@luminex.com.tr
- **Telefon**: +90 850 123 45 67
