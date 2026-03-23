/**
 * Admin Single Test API
 *
 * GET    /api/admin/tests/[testId]  — fetch test with all questions
 * PUT    /api/admin/tests/[testId]  — update test details
 * DELETE /api/admin/tests/[testId]  — delete test and cascade questions
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Reusable admin auth guard — returns session or null
async function adminGuard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: { testId: string } }) {
  if (!await adminGuard()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const test = await prisma.test.findUnique({
    where: { id: params.testId },
    include: {
      questions: {
        include: { options: true, keywords: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(test);
}

export async function PUT(req: NextRequest, { params }: { params: { testId: string } }) {
  if (!await adminGuard()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, subject, course, durationMinutes } = await req.json();

  const test = await prisma.test.update({
    where: { id: params.testId },
    data: {
      title,
      description,
      subject: subject || null,
      course: course || null,
      durationMinutes: Number(durationMinutes),
    },
  });

  return NextResponse.json(test);
}

export async function DELETE(_: NextRequest, { params }: { params: { testId: string } }) {
  if (!await adminGuard()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.test.delete({ where: { id: params.testId } });
  return NextResponse.json({ success: true });
}
