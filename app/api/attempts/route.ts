/**
 * POST /api/attempts
 * Creates a new attempt for the given testId.
 * If an in-progress attempt already exists, returns it instead of creating a duplicate.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { testId } = await req.json();

  // Resume existing in-progress attempt if one exists
  const existing = await prisma.attempt.findFirst({
    where: { userId: session.user.id, testId, status: "IN_PROGRESS" },
  });
  if (existing) return NextResponse.json(existing);

  const attempt = await prisma.attempt.create({
    data: { userId: session.user.id, testId },
  });

  return NextResponse.json(attempt, { status: 201 });
}
