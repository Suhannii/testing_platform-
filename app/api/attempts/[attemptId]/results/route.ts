/**
 * GET /api/attempts/[attemptId]/results
 * Returns a completed attempt with full answer breakdown:
 * - Each answer includes the question, options, keywords, and correctness info.
 * Accessible by the attempt owner or an admin.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { attemptId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: {
      test: true,
      user: { select: { name: true, email: true } },
      answers: {
        include: {
          question: { include: { options: true, keywords: true } },
          selectedOption: true,
        },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the owner or an admin can view results
  if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(attempt);
}
