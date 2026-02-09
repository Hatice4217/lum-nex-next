// LUMINEX Next.js - TypeScript Tip Tanımlamaları

import { UserRole, Gender, AppointmentStatus, TestStatus, MessageType, MessageStatus, NotificationType, PaymentStatus, PaymentMethod, AuditAction } from '@prisma/client';

// ============================================
// USER TYPES
// ============================================

export type UserRoleType = UserRole;
export type GenderType = Gender;

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;
  avatar?: string | null;
  phone?: string | null;
  dateOfBirth?: Date | null;
}

export interface PatientProfileExtended {
  bloodType?: string | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  insuranceNo?: string | null;
  insuranceCompany?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
}

export interface DoctorProfileExtended {
  licenseNo: string;
  hospitalId?: string | null;
  departmentId?: string | null;
  title?: string | null;
  experience?: number | null;
  education?: string | null;
  specializations?: string | null;
  biography?: string | null;
  consultationFee?: number | null;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  languages?: string | null;
  schedule?: string | null;
  hospital?: {
    id: string;
    name: string;
    slug: string;
  };
  department?: {
    id: string;
    name: string;
    slug: string;
  };
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export type AppointmentStatusType = AppointmentStatus;

export interface AppointmentSlot {
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AppointmentForm {
  doctorId: string;
  hospitalId?: string;
  departmentId?: string;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  reason?: string;
  symptoms?: string;
  isOnline?: boolean;
}

// ============================================
// DOCTOR TYPES
// ============================================

export interface DoctorFilter {
  department?: string;
  hospital?: string;
  city?: string;
  date?: Date;
  minRating?: number;
  maxFee?: number;
  isOnlineAvailable?: boolean;
  search?: string;
}

export interface DoctorCard {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  hospital?: string | null;
  rating: number;
  totalReviews: number;
  consultationFee?: number | null;
  isAvailable: boolean;
  avatar?: string | null;
  biography?: string | null;
}

// ============================================
// TEST RESULT TYPES
// ============================================

export type TestStatusType = TestStatus;

export interface TestResultForm {
  testType: string;
  testName: string;
  description?: string;
  testDate: Date;
}

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageTypeEnum = MessageType;
export type MessageStatusEnum = MessageStatus;

export interface Conversation {
  id: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    role: UserRoleType;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount: number;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationTypeEnum = NotificationType;

export interface NotificationItem {
  id: string;
  type: NotificationTypeEnum;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentStatusEnum = PaymentStatus;
export type PaymentMethodEnum = PaymentMethod;

export interface PaymentForm {
  appointmentId?: string;
  amount: number;
  method: PaymentMethodEnum;
  description?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tcKimlikNo?: string;
  phone?: string;
  role?: UserRoleType;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    perPage?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// FORM TYPES
// ============================================

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: FormError[];
}

// ============================================
// LANGUAGE TYPES
// ============================================

export type Language = 'tr' | 'en';

export interface Translation {
  [key: string]: string | Translation;
}

// ============================================
// THEME TYPES
// ============================================

export type Theme = 'light' | 'dark';

// ============================================
// DASHBOARD STATS TYPES
// ============================================

export interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DashboardStats {
  upcomingAppointments: number;
  completedAppointments: number;
  prescriptions: number;
  testResults: number;
  unreadMessages: number;
  unpaidPayments?: number;
}

// ============================================
// SYMPTOM CHECKER TYPES
// ============================================

export interface Symptom {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SymptomCheckerResult {
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  possibleConditions: string[];
  recommendations: string[];
  suggestedDepartment?: string;
  shouldSeeDoctor: boolean;
}

// ============================================
// HOSPITAL TYPES
// ============================================

export interface HospitalCard {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  district?: string | null;
  logo?: string | null;
  image?: string | null;
  rating: number;
  totalReviews: number;
  emergencyService: boolean;
}

export interface DepartmentItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isActive: boolean;
}
