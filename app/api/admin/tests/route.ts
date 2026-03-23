/**
 * Admin Tests API
 *
 * GET  /api/admin/tests  — list all tests with question counts
 * POST /api/admin/tests  — create a new test (draft by default)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const tests = await prisma.test.findMany({
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, subject, course, durationMinutes } = await req.json();
  if (!title || !durationMinutes) {
    return NextResponse.json({ error: "Title and duration are required" }, { status: 400 });
  }

  const test = await prisma.test.create({
    data: {
      title,
      description,
      subject: subject || null,
      course: course || null,
      durationMinutes: Number(durationMinutes),
      createdBy: session.user.id,
    },
  });

  return NextResponse.json(test, { status: 201 });
}
