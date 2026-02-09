// LUMINEX Next.js - Zod Validation Schemas
// Tüm form ve API validasyonları

import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

// TC Kimlik No validasyonu (11 haneli, belirli kurallara uygun)
const tcKimlikNoSchema = z.string()
  .length(11, 'TC Kimlik numarası 11 haneli olmalıdır')
  .regex(/^\d+$/, 'TC Kimlik numarası sadece rakamlardan oluşmalıdır')
  .refine((value) => {
    // TC Kimlik No algoritması kontrolü
    const digits = value.split('').map(Number);
    const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11] = digits;

    // İlk 9 rakamın toplamı
    const sum1to9 = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9;

    // 10. rakam: (İlk 9 rakamın toplamı) % 10
    const tenthDigit = sum1to9 % 10;
    if (d10 !== tenthDigit) return false;

    // 11. rakam: (1, 3, 5, 7, 9. rakamlar toplamı * 7 - (2, 4, 6, 8. rakamlar toplamı)) % 10
    const sumOddPositions = d1 + d3 + d5 + d7 + d9;
    const sumEvenPositions = d2 + d4 + d6 + d8;
    const eleventhDigit = ((sumOddPositions * 7) - sumEvenPositions) % 10;
    if (d11 !== eleventhDigit) return false;

    return true;
  }, 'Geçersiz TC Kimlik numarası');

// Email validasyonu (Türkçe karakter destekli)
const emailSchema = z.string()
  .min(1, 'E-posta adresi gereklidir')
  .email('Geçersiz e-posta adresi')
  .max(255, 'E-posta adresi çok uzun')
  .toLowerCase();

// Şifre validasyonu (en az 8 karakter, 1 büyük, 1 küçük, 1 rakam, 1 özel karakter)
const passwordSchema = z.string()
  .min(8, 'Şifre en az 8 karakter olmalıdır')
  .max(128, 'Şifre çok uzun')
  .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
  .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
  .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
  .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir (!@#$%^&* gibi)');

// Telefon validasyonu (Türkiye formatı)
const phoneSchema = z.string()
  .regex(/^(\+90|0)?[0-9]{10}$/, 'Geçersiz telefon numarası (05551234567 formatında olmalıdır)')
  .optional();

// Login form validasyonu
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string()
    .min(1, 'Şifre gereklidir')
    .max(128, 'Şifre çok uzun'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Register form validasyonu (Hasta)
export const registerPatientSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim çok uzun')
    .regex(/^[a-zA-ZğĞıİşŞöÖçÇüÜ\s]+$/, 'İsim sadece harflerden oluşmalıdır'),
  lastName: z.string()
    .min(2, 'Soyisim en az 2 karakter olmalıdır')
    .max(50, 'Soyisim çok uzun')
    .regex(/^[a-zA-ZğĞıİşŞöÖçÇüÜ\s]+$/, 'Soyisim sadece harflerden oluşmalıdır'),
  tcKimlikNo: tcKimlikNoSchema,
  phone: phoneSchema,
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Doğum tarihi YYYY-MM-DD formatında olmalıdır')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 14 && age <= 120;
    }, 'Yaş 14 ile 120 arasında olmalıdır')
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Kullanım koşullarını kabul etmelisiniz' }),
  }),
  acceptKvkk: z.literal(true, {
    errorMap: () => ({ message: 'KVKK aydınlatma metnini kabul etmelisiniz' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;

// Register form validasyonu (Doktor)
export const registerDoctorSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  firstName: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim çok long')
    .regex(/^[a-zA-ZğĞıİşŞöÖçÇüÜ\s]+$/, 'İsim sadece harflerden oluşmalıdır'),
  lastName: z.string()
    .min(2, 'Soyisim en az 2 karakter olmalıdır')
    .max(50, 'Soyisim çok uzun')
    .regex(/^[a-zA-ZğĞıİşŞöÖçÇüÜ\s]+$/, 'Soyisim sadece harflerden oluşmalıdır'),
  tcKimlikNo: tcKimlikNoSchema,
  phone: phoneSchema,
  licenseNo: z.string()
    .min(1, 'Meslek kimlik numarası gereklidir')
    .regex(/^[A-Za-z0-9]+$/, 'Geçersiz meslek kimlik numarası'),
  title: z.enum(['Prof. Dr.', 'Doç. Dr.', 'Dr.', 'Uzm. Dr.', 'Dr. Öğr. Üyesi']).optional(),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
  experience: z.number()
    .min(0, 'Deneyim yılı 0 veya daha büyük olmalıdır')
    .max(60, 'Deneyim yılı 60\'dan küçük olmalıdır')
    .optional(),
  biography: z.string()
    .max(1000, 'Biyografi çok uzun')
    .optional(),
  consultationFee: z.number()
    .min(0, 'Danışmanlık ücreti negatif olamaz')
    .max(10000, 'Danışmanlık ücreti çok yüksek')
    .optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Kullanım koşullarını kabul etmelisiniz' }),
  }),
  acceptKvkk: z.literal(true, {
    errorMap: () => ({ message: 'KVKK aydınlatma metnini kabul etmelisiniz' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type RegisterDoctorInput = z.infer<typeof registerDoctorSchema>;

// ============================================
// PASSWORD RESET SCHEMAS
// ============================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token gereklidir'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// APPOINTMENT SCHEMAS
// ============================================

export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doktor seçimi gereklidir'),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
  appointmentDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı')
    .refine((date) => {
      const appointmentDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today;
    }, 'Randevu tarihi bugünden önce olamaz'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı (HH:MM)'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı (HH:MM)'),
  duration: z.number()
    .min(15, 'Randevu süresi en az 15 dakika olmalıdır')
    .max(180, 'Randevu süresi en fazla 180 dakika olabilir')
    .default(30),
  reason: z.string()
    .max(500, 'Şikayet/konu çok uzun')
    .optional(),
  symptoms: z.string()
    .max(1000, 'Şikayet detayı çok uzun')
    .optional(),
  isOnline: z.boolean().default(false),
  notes: z.string()
    .max(1000, 'Not çok uzun')
    .optional(),
}).refine((data) => {
  // Bitiş saati başlangıçtan sonra olmalı
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  return endMinutes > startMinutes;
}, {
  message: 'Bitiş saati başlangıç saatinden sonra olmalıdır',
  path: ['endTime'],
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

// Randevu iptal validasyonu
export const cancelAppointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Randevu ID gereklidir'),
  reason: z.string()
    .min(5, 'İptal sebebi en az 5 karakter olmalıdır')
    .max(500, 'İptal sebebi çok uzun')
    .optional(),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

// ============================================
// PATIENT PROFILE SCHEMAS
// ============================================

export const patientProfileSchema = z.object({
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-']).optional(),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
  emergencyContact: z.string()
    .min(2, 'Acil durum kontak ismi en az 2 karakter olmalıdır')
    .optional(),
  emergencyPhone: phoneSchema,
  insuranceNo: z.string().optional(),
  insuranceCompany: z.string().optional(),
  address: z.string()
    .max(500, 'Adres çok uzun')
    .optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  notes: z.string()
    .max(1000, 'Not çok uzun')
    .optional(),
});

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;

// ============================================
// DOCTOR PROFILE SCHEMAS
// ============================================

export const doctorProfileSchema = z.object({
  title: z.enum(['Prof. Dr.', 'Doç. Dr.', 'Dr.', 'Uzm. Dr.', 'Dr. Öğr. Üyesi']).optional(),
  hospitalId: z.string().optional(),
  departmentId: z.string().optional(),
  experience: z.number()
    .min(0)
    .max(60)
    .optional(),
  education: z.string().optional(),
  specializations: z.string().optional(),
  biography: z.string()
    .max(2000, 'Biyografi çok uzun')
    .optional(),
  consultationFee: z.number()
    .min(0)
    .max(10000)
    .optional(),
  languages: z.string().optional(),
  schedule: z.string().optional(),
  notes: z.string().optional(),
});

export type DoctorProfileInput = z.infer<typeof doctorProfileSchema>;

// ============================================
// DOCTOR AVAILABILITY SCHEMAS
// ============================================

export const blockedSlotSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı'),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı'),
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Geçersiz saat formatı'),
  reason: z.string()
    .max(200, 'Sebep çok uzun')
    .optional(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.string().optional(), // JSON array: [1,3,5] for Monday, Wednesday, Friday
}).refine((data) => {
  const [startHour, startMinute] = data.startTime.split(':').map(Number);
  const [endHour, endMinute] = data.endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  return endMinutes > startMinutes;
}, {
  message: 'Bitiş saati başlangıç saatinden sonra olmalıdır',
  path: ['endTime'],
});

export type BlockedSlotInput = z.infer<typeof blockedSlotSchema>;

// ============================================
// PRESCRIPTION SCHEMAS
// ============================================

export const prescriptionSchema = z.object({
  patientId: z.string().min(1, 'Hasta ID gereklidir'),
  appointmentId: z.string().optional(),
  diagnosis: z.string()
    .min(5, 'Tanı en az 5 karakter olmalıdır')
    .max(1000, 'Tanı çok uzun'),
  medications: z.string()
    .min(1, 'İlaç listesi gereklidir')
    .refine((val) => {
      try {
        const meds = JSON.parse(val);
        return Array.isArray(meds) && meds.length > 0;
      } catch {
        return false;
      }
    }, 'İlaç listesi geçersiz JSON formatında'),
  dosage: z.string()
    .max(500, 'Doz bilgisi çok uzun')
    .optional(),
  usage: z.string()
    .max(500, 'Kullanım bilgisi çok uzun')
    .optional(),
  notes: z.string()
    .max(1000, 'Not çok uzun')
    .optional(),
  validUntil: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı')
    .optional(),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;

// ============================================
// TEST RESULT SCHEMAS
// ============================================

export const testResultSchema = z.object({
  patientId: z.string().min(1, 'Hasta ID gereklidir'),
  testType: z.string()
    .min(1, 'Test tipi gereklidir')
    .max(100, 'Test tipi çok uzun'),
  testName: z.string()
    .min(1, 'Test adı gereklidir')
    .max(200, 'Test adı çok uzun'),
  description: z.string()
    .max(500, 'Açıklama çok uzun')
    .optional(),
  testDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçersiz tarih formatı'),
  results: z.string().optional(),
  notes: z.string()
    .max(1000, 'Not çok uzun')
    .optional(),
});

export type TestResultInput = z.infer<typeof testResultSchema>;

// ============================================
// MESSAGE SCHEMAS
// ============================================

export const messageSchema = z.object({
  receiverId: z.string().min(1, 'Alıcı ID gereklidir'),
  appointmentId: z.string().optional(),
  type: z.enum(['TEXT', 'IMAGE', 'DOCUMENT']).default('TEXT'),
  content: z.string()
    .min(1, 'Mesaj içeriği gereklidir')
    .max(5000, 'Mesaj çok uzun'),
  fileUrl: z.string().optional(),
});

export type MessageInput = z.infer<typeof messageSchema>;

// ============================================
// PAYMENT SCHEMAS
// ============================================

export const paymentSchema = z.object({
  appointmentId: z.string().optional(),
  amount: z.number()
    .min(1, 'Tutar en az 1 TL olmalıdır')
    .max(100000, 'Tutar çok yüksek'),
  method: z.enum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'ONLINE']),
  description: z.string()
    .max(500, 'Açıklama çok uzun')
    .optional(),
  cardNumber: z.string()
    .regex(/^\d{16}$/, 'Geçersiz kredi kartı numarası')
    .optional(),
  cardHolder: z.string()
    .min(2, 'Kart sahibi ismi gereklidir')
    .optional(),
  cardExpiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Geçersiz son kullanma tarihi (AA/YY)')
    .optional(),
  cardCvv: z.string()
    .regex(/^\d{3,4}$/, 'Geçersiz CVV')
    .optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

// ============================================
// SYMPTOM CHECKER SCHEMA
// ============================================

export const symptomCheckerSchema = z.object({
  symptoms: z.array(z.string())
    .min(1, 'En az bir belirti seçmelisiniz')
    .max(20, 'Çok fazla belirti seçtiniz'),
  age: z.number()
    .min(0)
    .max(120)
    .optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  duration: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  additionalInfo: z.string()
    .max(500, 'Ek bilgiler çok uzun')
    .optional(),
});

export type SymptomCheckerInput = z.infer<typeof symptomCheckerSchema>;

// ============================================
// ADMIN SCHEMAS
// ============================================

// Hastane oluşturma/ güncelleme
export const hospitalSchema = z.object({
  name: z.string()
    .min(2, 'Hastane adı en az 2 karakter olmalıdır')
    .max(100, 'Hastane adı çok uzun'),
  slug: z.string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  address: z.string()
    .max(500, 'Adres çok uzun')
    .optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  phone: phoneSchema,
  email: emailSchema.optional(),
  website: z.string().url().optional(),
  description: z.string()
    .max(2000, 'Açıklama çok uzun')
    .optional(),
  facilities: z.string().optional(),
  workingHours: z.string().optional(),
  emergencyService: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type HospitalInput = z.infer<typeof hospitalSchema>;

// Departman oluşturma/ güncelleme
export const departmentSchema = z.object({
  name: z.string()
    .min(2, 'Departman adı en az 2 karakter olmalıdır')
    .max(50, 'Departman adı çok uzun'),
  slug: z.string()
    .min(2, 'Slug en az 2 karakter olmalıdır')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir'),
  hospitalId: z.string().optional(),
  description: z.string()
    .max(1000, 'Açıklama çok uzun')
    .optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;

// Kullanıcı yönetimi (Admin)
export const adminUserSchema = z.object({
  firstName: z.string()
    .min(2, 'İsim en az 2 karakter olmalıdır')
    .max(50, 'İsim çok uzun'),
  lastName: z.string()
    .min(2, 'Soyisim en az 2 karakter olmalıdır')
    .max(50, 'Soyisim çok uzun'),
  email: emailSchema,
  role: z.enum(['PATIENT', 'DOCTOR', 'ADMIN']),
  phone: phoneSchema,
  isActive: z.boolean().default(true),
  reason: z.string()
    .max(500, 'Sebep çok uzun')
    .optional(),
});

export type AdminUserInput = z.infer<typeof adminUserSchema>;

// ============================================
// SEARCH & FILTER SCHEMAS
// ============================================

export const doctorFilterSchema = z.object({
  department: z.string().optional(),
  hospital: z.string().optional(),
  city: z.string().optional(),
  date: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxFee: z.number().min(0).optional(),
  isOnlineAvailable: z.boolean().optional(),
  search: z.string()
    .max(100, 'Arama terimi çok uzun')
    .optional(),
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(12),
});

export type DoctorFilterInput = z.infer<typeof doctorFilterSchema>;

// ============================================
// EXPORT HELPER
// ============================================

// Validation error formatter
export const formatZodError = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return errors;
};

// Validate helper function
export const validateSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: formatZodError(result.error),
  };
};
