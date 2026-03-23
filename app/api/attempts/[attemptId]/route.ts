/**
 * GET /api/attempts/[attemptId]
 * Returns a full attempt including the test, all questions with options/keywords,
 * and any previously saved answers.
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
      test: {
        include: {
          questions: {
            include: { options: true, keywords: true },
            orderBy: { order: "asc" },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only the owner or an admin can view this attempt
  if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(attempt);
}
