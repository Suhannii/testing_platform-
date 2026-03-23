/**
 * UserNavbar
 * Top navigation bar shown on user-facing pages.
 * Displays the platform name, the logged-in user's name, and a sign-out button.
 */

"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";

interface Props {
  userName: string;
}

export default function UserNavbar({ userName }: Props) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-gray-900 text-sm">
          Testing Platform
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userName}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-red-600 hover:underline"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
