/**
 * GET /api/tests
 * Returns all published tests for the logged-in user's dashboard.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tests = await prisma.test.findMany({
    where: { isPublished: true },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tests);
}
