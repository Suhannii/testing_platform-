/**
 * User Dashboard (server component)
 * Fetches published tests and past attempts, then passes them to
 * the client-side DashboardView for filtering and display.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserNavbar from "@/components/UserNavbar";
import DashboardView from "./DashboardView";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [tests, attempts] = await Promise.all([
    prisma.test.findMany({
      where: { isPublished: true },
      include: { _count: { select: { questions: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.attempt.findMany({
      where: { userId: session.user.id, status: "SUBMITTED" },
      include: { test: { select: { title: true, subject: true, course: true } } },
      orderBy: { submittedAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <UserNavbar userName={session.user.name ?? ""} />
      <DashboardView tests={tests as any} attempts={attempts as any} />
    </div>
  );
}
