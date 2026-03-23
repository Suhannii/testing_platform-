/**
 * PATCH /api/admin/tests/[testId]/publish
 * Toggles the published state of a test.
 * Published tests are visible to regular users on their dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(_: NextRequest, { params }: { params: { testId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const test = await prisma.test.findUnique({ where: { id: params.testId } });
  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Toggle publish state
  const updated = await prisma.test.update({
    where: { id: params.testId },
    data: { isPublished: !test.isPublished },
  });

  return NextResponse.json(updated);
}
