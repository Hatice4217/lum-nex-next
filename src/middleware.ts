// LUMINEX Next.js - Middleware
// Route protection, role-based access, license validation

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { UserRole } from '@prisma/client';

type RouteConfig = {
  requiresAuth: boolean;
  roles?: UserRole[];
  licenseRequired?: boolean;
};

// Route configurations
const publicRoutes: string[] = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/doctors',
  '/hospitals',
  '/about',
  '/contact',
  '/kvkk',
  '/privacy',
  '/terms',
  '/cookies',
  '/api/auth',
];

const patientRoutes: string[] = [
  '/dashboard',
  '/appointment',
  '/symptom-checker',
  '/prescriptions',
  '/test-results',
  '/messages',
  '/payments',
  '/profile',
];

const doctorRoutes: string[] = [
  '/doctor',
];

const adminRoutes: string[] = [
  '/admin',
];

const apiProtectedRoutes: string[] = [
  '/api/appointments',
  '/api/prescriptions',
  '/api/test-results',
  '/api/messages',
  '/api/payments',
  '/api/notifications',
  '/api/user',
  '/api/admin',
];

// Get route configuration
function getRouteConfig(pathname: string): RouteConfig {
  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    // Public API routes
    if (pathname.startsWith('/api/auth')) {
      return { requiresAuth: false };
    }

    // Protected API routes
    if (apiProtectedRoutes.some(route => pathname.startsWith(route))) {
      return { requiresAuth: true, licenseRequired: true };
    }
  }

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return { requiresAuth: false };
  }

  // Check if it's a patient route
  if (patientRoutes.some(route => pathname.startsWith(route))) {
    return { requiresAuth: true, roles: [UserRole.PATIENT], licenseRequired: true };
  }

  // Check if it's a doctor route
  if (doctorRoutes.some(route => pathname.startsWith(route))) {
    return { requiresAuth: true, roles: [UserRole.DOCTOR], licenseRequired: true };
  }

  // Check if it's an admin route
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    return { requiresAuth: true, roles: [UserRole.ADMIN], licenseRequired: true };
  }

  // Default: protected route
  return { requiresAuth: true, licenseRequired: true };
}

// Validate license
async function validateLicense(request: Request): Promise<boolean> {
  // Skip license validation in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  // Get domain from request
  const url = new URL(request.url);
  const domain = url.hostname;

  // Skip for localhost
  if (domain === 'localhost' || domain === '127.0.0.1') {
    return true;
  }

  // Check license in database
  try {
    const { prisma } = await import('@/lib/db');

    const license = await prisma.license.findFirst({
      where: {
        domain: domain,
        isActive: true,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    return !!license;
  } catch (error) {
    console.error('License validation error:', error);
    return false;
  }
}

export async function middleware(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Get route configuration
  const routeConfig = getRouteConfig(pathname);

  // Check if authentication is required
  if (routeConfig.requiresAuth) {
    const session = await auth();

    if (!session || !session.user) {
      // Redirect to login with callback URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role requirements
    if (routeConfig.roles && routeConfig.roles.length > 0) {
      const userRole = session.user.role;

      if (!routeConfig.roles.includes(userRole as UserRole)) {
        // User doesn't have required role
        // Redirect to appropriate dashboard or show forbidden
        if (userRole === UserRole.PATIENT) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        } else if (userRole === UserRole.DOCTOR) {
          return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
        } else if (userRole === UserRole.ADMIN) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Check license if required
    if (routeConfig.licenseRequired) {
      const isValid = await validateLicense(request);

      if (!isValid) {
        // License invalid - show error page
        return NextResponse.redirect(new URL('/license-error', request.url));
      }
    }
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
