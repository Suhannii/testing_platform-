/**
 * GET /api/admin/tests/[testId]/results
 * Returns all submitted attempts for a test along with aggregate stats:
 * - totalAttempts, averageScore, highestScore
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { testId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const test = await prisma.test.findUnique({
    where: { id: params.testId },
    include: {
      attempts: {
        where: { status: "SUBMITTED" },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Compute aggregate statistics
  const scores = test.attempts.map((a: { score: number | null }) => a.score ?? 0);
  const stats = {
    totalAttempts: scores.length,
    averageScore: scores.length
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0,
    highestScore: scores.length ? Math.max(...scores) : 0,
  };

  return NextResponse.json({ test, stats });
}
