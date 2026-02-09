// LUMINEX Next.js - Authentication & Authorization
// NextAuth.js v5 configuration

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { UserRole } from '@prisma/client';

// ============================================
// AUTH CONFIGURATION
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials);

          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
              patientProfile: true,
              doctorProfile: {
                include: {
                  hospital: true,
                  department: true,
                },
              },
            },
          });

          if (!user) {
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new Error('ACCOUNT_LOCKED');
          }

          // Check if account is active
          if (!user.isActive) {
            throw new Error('ACCOUNT_INACTIVE');
          }

          // Verify password
          const passwordMatch = await bcrypt.compare(password, user.password);

          if (!passwordMatch) {
            // Increment failed login attempts
            const failedAttempts = user.failedLoginAttempts + 1;

            // Lock account after 5 failed attempts
            if (failedAttempts >= 5) {
              const lockedUntil = new Date();
              lockedUntil.setMinutes(lockedUntil.getMinutes() + 15); // Lock for 15 minutes

              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: failedAttempts,
                  lockedUntil,
                },
              });

              throw new Error('ACCOUNT_LOCKED');
            }

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
              },
            });

            return null;
          }

          // Reset failed login attempts on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLoginAt: new Date(),
            },
          });

          // Create audit log
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'LOGIN',
              description: 'Kullanıcı giriş yaptı',
            },
          });

          // Return user object
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
          };
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof Error) {
            if (error.message === 'ACCOUNT_LOCKED') {
              throw new Error('Hesabınız çok fazla başarısız giriş denemesi nedeniyle geçici olarak kilitlendi. Lütfen 15 dakika sonra tekrar deneyin.');
            }
            if (error.message === 'ACCOUNT_INACTIVE') {
              throw new Error('Hesabınız aktif değil. Lütfen yönetici ile iletişime geçin.');
            }
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatar = user.avatar;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.avatar = token.avatar as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// ============================================
// AUTH HELPER FUNCTIONS
// ============================================

/**
 * Get current session server-side
 */
export async function getSession() {
  return await auth();
}

/**
 * Get current user server-side
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();

  if (!user.role || !roles.includes(user.role as UserRole)) {
    throw new Error('FORBIDDEN');
  }

  return user;
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password with bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate secure random token
 */
export function generateToken(): string {
  return crypto.randomUUID();
}

/**
 * Generate password reset token
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    return null;
  }

  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

  // Store token in user record (you might want a separate table)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      // You could add a resetToken field to the User model
      // For now, we'll use a different approach
    },
  });

  return token;
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<boolean> {
  // Verify token logic here
  // This is a placeholder - you'd need to store tokens properly
  return true;
}

/**
 * Create user with hashed password
 */
export async function createUser(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  tcKimlikNo?: string;
  phone?: string;
}) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role || UserRole.PATIENT,
      tcKimlikNo: data.tcKimlikNo,
      phone: data.phone,
    },
  });
}

/**
 * Update user password
 */
export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'PASSWORD_CHANGE',
      description: 'Kullanıcı şifresini değiştirdi',
    },
  });
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  return !!user;
}

/**
 * Check if TC Kimlik No exists
 */
export async function tcKimlikNoExists(tcKimlikNo: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { tcKimlikNo },
  });

  return !!user;
}

/**
 * Validate TC Kimlik No
 */
export function validateTcKimlikNo(tcKimlikNo: string): boolean {
  // TC Kimlik No should be 11 digits
  if (!/^\d{11}$/.test(tcKimlikNo)) {
    return false;
  }

  const digits = tcKimlikNo.split('').map(Number);
  const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11] = digits;

  // First digit cannot be 0
  if (d1 === 0) {
    return false;
  }

  // 10th digit check
  const sum1to9 = d1 + d2 + d3 + d4 + d5 + d6 + d7 + d8 + d9;
  const tenthDigit = sum1to9 % 10;
  if (d10 !== tenthDigit) {
    return false;
  }

  // 11th digit check
  const sumOddPositions = d1 + d3 + d5 + d7 + d9;
  const sumEvenPositions = d2 + d4 + d6 + d8;
  const eleventhDigit = ((sumOddPositions * 7) - sumEvenPositions) % 10;
  if (d11 !== eleventhDigit) {
    return false;
  }

  return true;
}
