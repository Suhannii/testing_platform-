/**
 * Client-side providers
 * SessionProvider must be a client component — it uses React context
 * to make the NextAuth session available throughout the app.
 */

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
