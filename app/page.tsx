/**
 * Home page (/)
 * Redirects authenticated users to their role-appropriate dashboard.
 * Shows a landing page with sign-in / register links for guests.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Redirect logged-in users based on role
  if (session) {
    if (session.user.role === "ADMIN") redirect("/admin/dashboard");
    else redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Testing Platform</h1>
        <p className="text-gray-600 mb-8 text-lg">
          A modern platform for creating and taking assessments.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
