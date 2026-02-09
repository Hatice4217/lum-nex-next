// LUMINEX Next.js - NextAuth Type Extensions
// Extend NextAuth types with our custom properties

import { UserRole } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
      avatar?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    avatar?: string | null;
  }
}
