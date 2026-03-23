/**
 * AdminSidebar
 * Persistent left navigation for the admin panel.
 * Highlights the active route and provides a sign-out button.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/tests/new", label: "New Test" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Branding */}
      <div className="p-4 border-b border-gray-200">
        <span className="font-bold text-gray-900 text-sm">Testing Platform</span>
        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
