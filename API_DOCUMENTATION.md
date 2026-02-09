# LUMINEX - API Dokümantasyonu

## 📋 İçindekiler

- [Genel Bilgiler](#genel-bilgiler)
- [Authentication API](#authentication-api)
- [Appointments API](#appointments-api)
- [Doctors API](#doctors-api)
- [Hospitals API](#hospitals-api)
- [Departments API](#departments-api)
- [Notifications API](#notifications-api)
- [Hata Kodları](#hata-kodları)

---

## 🔑 Genel Bilgiler

### Base URL
```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

### Content-Type
```json
Content-Type: application/json
```

### Auth Schema
```json
{
  "authorization": "Bearer <JWT_TOKEN>"
}
```

### Response Format
```json
{
  "success": true|false,
  "data": { /* response data */ },
  "error": {
    "code": "ERROR_CODE",
    "message": "Hata mesajı",
    "details": { /* ek bilgiler }
  },
  "meta": {
    "page": 1,
    "perPage": 10,
    "total": 100,
    "totalPages: 10
  }
}
```

---

## 🔐 Authentication API

### POST /api/auth/register
Yeni kullanıcı kaydı oluşturur.

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Ahmet",
  "lastName": "Yılmaz",
  "tcKimlikNo": "12345678901",
  "phone": "+905551234567",
  "role": "PATIENT"
}
```

**Fields:**

| Alan | Tip | Zorunlu | Açıklama |
|-----|----|--------|----------|
| email | string | ✅ | Email formatı, unique |
| password | string | ✅ | Min 8 karakter, 1 büyük, 1 küçük, 1 rakam, 1 özel |
| firstName | string | ✅ | 2-50 karakter |
| lastName | string | ✅ | 2-50 karakter |
| tcKimlikNo | string | ❌ | 11 hanel, TC Kimlik algoritması |
| phone | string | ❌ | Türkiye formatı |
| role | enum | ✅ | PATIENT, DOCTOR, ADMIN |

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "firstName": "Ahmet",
      "role": "PATIENT"
    }
  },
  "message": "Kayıt başarılı. Giriş yapabilirsiniz."
}
```

**Hata Örnekleri:**

```json
// 400 Bad Request - Validasyon hatası
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz veri",
    "details": {
      "email": "Email formatı geçersiz"
    }
  }
}

// 400 Bad Request - Email zaten var
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Bu e-posta adresi zaten kullanımda"
  }
}

// 400 Bad Request - TC Kimlik zaten var
{
  "success": false,
  "error": {
    "code": "TCKIMLIK_EXISTS",
    "message": "Bu TC Kimlik numarası zaten kullanımda"
  }
}
```

### POST /api/auth/forgot-password
Şifre sıfırlama bağlantısı gönderir.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "E-posta adresinize şifre sıfırlama bağlantısı gönderildi."
}
```

### POST /api/auth/reset-password
Şifreyi sıfırlar (token ile).

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-uuid",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Password Kuralları:**
- Minimum 8 karakter
- En az 1 büyük harf (A-Z)
- En az 1 küçük harf (a-z)
- En az 1 rakam (0-9)
- En az 1 özel karakter (!@#$%^&*)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Şifreniz başarıyla sıfırlandı."
}
```

---

## 📅 Appointments API

### GET /api/appointments
Randevu listesini getirir (filtreleme ile).

**Endpoint:** `GET /api/appointments`

**Query Parameters:**

| Param | Tip | Açıklama |
|-------|----|-----------|
| status | string | PENDING, CONFIRMED, CANCELLED, COMPLETED |
| page | number | Sayfa numarası (default: 1) |
| perPage | number | Sayfa başına sonuç (default: 10) |

**Auth Required:** ✅ (Session cookie)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "appointmentNo": "RNV20250101001",
      "patientId": "clx...",
      "doctorId": "clx...",
      "appointmentDate": "2025-01-15T10:00:00Z",
      "startTime": "10:00",
      "endTime": "10:30",
      "status": "CONFIRMED",
      "reason": "Kontrol muayenesi",
      "isOnline": false,
      "createdAt": "2025-01-10T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "perPage: 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### POST /api/appointments
Yeni randevu oluşturur.

**Endpoint:** `POST /api/appointments`

**Auth Required:** ✅ (Patient role)

**Request Body:**

```json
{
  "doctorId": "doctor-id-here",
  "hospitalId": "hospital-id-here",
  "departmentId": "department-id-here",
  "appointmentDate": "2025-02-15",
  "startTime": "10:00",
  "endTime": "10:30",
  "duration": 30,
  "reason": "Kontrol",
  "symptoms": "Baş ağrı, nefes darlığı",
  "isOnline": false,
  "notes": "Hasta randevu öncesi bilgilendirildi"
}
```

**Fields:**

| Alan | Tip | Zorunlu | Açıklama |
|-----|----|--------|----------|
| doctorId | string | ✅ | Geçerli doktor ID |
| appointmentDate | string | ✅ | YYYY-MM-DD formatı |
| startTime | string | ✅ | HH:MM formatı |
| endTime | string | ✅ | HH:MM formatı |
| duration | number | ✅ | Dakika cinsinden |
| reason | string | ❌ | Randevu sebebi |
| isOnline | boolean | ❌ | Online görüşme |

**Validation:**
- startTime < endTime
- appointmentDate >= bugün
- Slot çakış kontrolü
- Doktor müsaitlik kontrolü

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "appointmentNo": "RNV20250205001",
    "status": "PENDING",
    "createdAt": "2025-02-08T10:30:00Z"
  },
  "message": "Randevu talebiniz oluşturuldu. Doktor onayladığında bildirim alacaksınız."
}
```

### GET /api/appointments/[id]
Randevu detayını getirir.

**Endpoint:** `GET /api/appointments/[id]`

**Auth Required:** ✅ (Patient, Doctor, or Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "appointmentNo": "RNV20250101001",
    "patient": {
      "user": {
        "firstName": "Ahmet",
        "lastName": "Yılmaz"
      }
    },
    "doctor": {
      "user": {
        "firstName": "Mehmet",
        "lastName": "Kaya",
        "title": "Prof. Dr."
      },
      "hospital": {
        "name": "Acımdem Kadıköy"
      }
    },
    "appointmentDate": "2025-01-15T10:00:00Z",
    "status": "CONFIRMED"
  }
}
```

### DELETE /api/appointments/[id]
Randevuyu iptal eder.

**Endpoint:** `DELETE /api/appointments/[id]`

**Auth Required:** ✅ (Patient or Doctor)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "status": "CANCELLED",
    "cancelledAt": "2025-02-08T11:30:00Z",
    "cancelledBy": "user-id"
  },
  "message": "Randevu iptal edildi"
}
```

---

## 👨‍⚕️ Doctors API

### GET /api/doctors
Doktor listesini getirir (filtreleme ile).

**Endpoint:** `GET /api/doctors`

**Query Parameters:**

| Param | Tip | Açıklama |
|-------|----|-----------|
| department | string | Bölüm slug (örn: "kardiyoloji") |
| hospital | string | Hastane slug |
| city | string | Şehir |
| search | string | İsim/soyisim ara |
| minRating | number | Minimum puan (örn: 4.5) |
| maxFee | number | Max ücret (örn: 1000) |
| isOnlineAvailable | boolean | Sadece online |
| page | number | Sayfa numarası |
| perPage | number | Sayfa başı |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "firstName": "Mehmet",
      "lastName": "Kaya",
      "title": "Prof. Dr.",
      "department": {
        "id": "dept-001",
        "name": "Kardiyoloji",
        "slug": "kardiyoloji"
      },
      "hospital": {
        "id": "hosp-001",
        "name": "Acıbadem Kadıköy",
        "city": "İstanbul"
      },
      "rating": 4.9,
      "totalReviews": 450,
      "consultationFee": 1500,
      "isAvailable": true
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 12,
    "total": 156,
    "totalPages": 13
  }
}
```

### GET /api/doctors/[id]
Doktor detaylarını getirir.

**Endpoint:** `GET /api/doctors/[id]`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "firstName": "Mehmet",
    "lastName": "Kaya",
    "title": "Prof. Dr.",
    "avatar": "/images/avatar.jpg",
    "rating": 4.9,
    "totalReviews": 450,
    "consultationFee": 1500,
    "isAvailable": true,
    "experience": 20,
    "biography": "Kardiyoloji alanında uzman...",
    "education": [
      { "year": "1995", "degree": "Tıp Fakültesi", "school": "İÜ" },
      { "year": "2000", "degree": "Kardiyoloji Uzmanlığı", "school": "Acıbadem" }
    ],
    "specializations": ["İnterventrik Kardiyoloji", "Pacemaker", "EKO"],
    "languages": ["Türkçe", "İngilizce", "Almanca"],
    "schedule": {
      "Pazartesi": "09:00 - 17:00",
      "Salı": "09:00 - 17:00",
      "Çarşamba": "09:00 - 15:00"
    },
    "upcomingAppointments": [
      {
        "appointmentDate": "2025-02-15",
        "startTime": "10:00",
        "status": "CONFIRMED"
      }
    ]
  }
}
```

---

## 🏥 Hospitals API

### GET /api/hospitals
Hastane listesini getirir.

**Endpoint:** `GET /api/hospitals`

**Query Parameters:**

| Param | Tip | Açıklama |
|-------|----|-----------|
| city | string | Şehir filtresi |
| search | string | İsim/aranma |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "hosp-001",
      "name": "Acıbadem Kadıköy Hastanesi",
      "slug": "acibadem-kadikoy",
      "city": "İstanbul",
      "district": "Kadıköy",
      "logo": "/images/hospitals/acibadem.png",
      "emergencyService": true,
      "rating": 4.7,
      "totalReviews": 1250,
      "doctorsCount": 45,
      "departmentsCount": 12
    }
  ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "total": 85,
    "totalPages: 5
  }
}
```

### GET /api/hospitals/[id]
Hastane detaylarını getirir.

**Endpoint:** `GET /api/hospitals/[id]`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "hosp-001",
    "name": "Acıbadem Kadıköy Hastanesi",
    "slug": "acibadem-kadikoy",
    "address": "Caferağa Mah. Dr.Şükrü Erdem Sok. No:23",
    "city": "İstanbul",
    "district": "Kadıköy",
    "phone": "+902163460000",
    "email": "kadikoy@acibadem.com.tr",
    "website": "https://www.acibadem.com.tr",
    "description": "Ulusal kurum, modern ekipman...",
    "facilities": ["7/24 Acil Servis", "MR", "CT"],
    "workingHours": {
      "Pazartesi": "00:00 - 24:00",
      "Salı": "00:00 - 24:00"
    },
    "emergencyService": true,
    "departments": [
      {
        "id": "dept-001",
        "name": "Kardiyoloji",
        "slug": "kardiyoloji",
        "doctorsCount": 8
      }
    ],
    "doctors": [
      {
        "id": "doc-001",
        "firstName": "Mehmet",
        "lastName": "Kaya",
        "title": "Prof. Dr.",
        "rating": 4.9
      }
    ]
  }
}
```

---

## 🏛️ Departments API

### GET /api/departments
Bölüm listesini getirir.

**Endpoint:** `GET /api/departments`

**Query Parameters:**

| Param | Tip | Açıklama |
|-------|----|-----------|
| hospitalId | string | Hastane ID |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "dept-001",
      "name": "Kardiyoloji",
      "slug": "kardiyoloji",
      "icon": "❤️",
      "isActive": true,
      "doctorsCount": 8
    }
  ]
}
```

---

## 🔔 Notifications API

### GET /api/notifications
Kullanıcının bildirimlerini getirir.

**Endpoint:** `GET /api/notifications`

**Auth Required:** ✅

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "notif-001",
      "type": "APPOINTMENT",
      "title": "Randevu Hatırlatması",
      "message": "Yarın saat 10:00'deki Prof. Dr. Mehmet Kaya randevunuz için hazırlanın.",
      "link": "/appointments/RNV20250101001",
      "isRead": false,
      "createdAt": "2025-02-14T20:30:00Z"
    }
  ],
  "meta": {
    "unreadCount": 5
  }
}
```

### POST /api/notifications/mark-all-read
Tüm bildirimleri okundu işaretler.

**Endpoint:** `POST /api/notifications/mark-all-read`

**Auth Required:** ✅

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Tüm bildirimler okundu olarak işaretlendi."
}
```

### POST /api/notifications/[id]/mark-read
Tek bildiriyi okundu işaretler.

**Endpoint:** `POST /api/notifications/[id]/mark-read`

**Auth Required:** ✅

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "notif-001",
    "isRead": true,
    "readAt": "2025-02-14T20:35:00Z"
  }
}
```

---

## ❌ Hata Kodları

### Client Errors (4xx)

| Kod | Mesaj | Açıklama |
|-----|-------|-----------|
| VALIDATION_ERROR | Geçersiz veri | Zod validasyon hatası |
| EMAIL_EXISTS | E-posta kullanımda | Bu e-posta zaten kayıtlı |
| TCKIMLIK_EXISTS | TC Kimlik kullanımda | Bu TC Kimlik zaten kayıtlı |
| UNAUTHORIZED | Yetkisiz | Giriş yapmalısınız |
| FORBIDDEN | Yasaklı | Bu işlem için yetkiniz yok |
| NOT_FOUND | Bulunamadı | Kaynak bulunamadı |
| RATE_LIMIT_EXCEEDED | Çok fazla istek | Lütfen bekleyin |
| INVALID_TOKEN | Geçersiz token | Token süresi doldu |

### Server Errors (5xx)

| Kod | Mesaj | Açıklama |
|-----|-------|-----------|
| INTERNAL_ERROR | Sunucu hatası | Beklenmeyen bir hata oluştu |
| DATABASE_ERROR | Veritabanı hatası | Veritabanına bağlanılamıyor |
| LICENSE_INVALID | Lisans geçersiz | Lisansınızın süresi doldu |
| SERVICE_UNAVAILABLE | Hizmet kullanımda | Lütfen sonra tekrar deneyin |

---

## 📝 Kullanım Örnekleri

### Randevu Oluşturma

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "doctorId": "doctor-id-here",
    "appointmentDate": "2025-02-15",
    "startTime": "10:00",
    "endTime": "10:30",
    "duration": 30,
    "reason": "Kontrol"
  }'
```

### Doktor Arama

```bash
curl -X GET "http://localhost:3000/api/doctors?department=kardiyoloji&city=İstanbul&minRating=4.5" \
  -H "Cookie: next-auth.session-token=..."
```

### Doktor Detayı

```bash
curl -X GET http://localhost:3000/api/doctors/doctor-id-here \
  -H "Cookie: next-auth.session-token=..."
```

---

## 🔄 Rate Limiting

API endpoint'leri için rate limiting kuralları:

| Endpoint | Limit | Pencere |
|----------|-------|---------|
| Auth endpoints | 10/dk  | 15 dk |
| POST /api/appointments | 20/dk | 15 dk |
| GET /api/doctors | 100/dk | 15 dk |
| POST /api/register | 5/dk | 1 saat |

---

## 📚 Diğer Dokümantasyonlar

Daha fazla bilgi için:
- [README.md](./README.md) - Kurulum ve kullanım
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Mimari detayları
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment rehberi
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Sorun giderme

---

*API Dokümantasyonu boyu: ~450 satır*
*Son güncelleme: 8 Şubat 2025*