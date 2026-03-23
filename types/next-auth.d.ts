/**
 * NextAuth type augmentations
 *
 * Extends the default Session, User, and JWT interfaces to include
 * the custom `id` and `role` fields we attach during authentication.
 */

import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string; // "ADMIN" | "USER"
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}
