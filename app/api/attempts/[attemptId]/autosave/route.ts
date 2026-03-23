/**
 * POST /api/attempts/[attemptId]/autosave
 * Saves the current state of answers without submitting.
 * Called automatically every 30 seconds from the test-taking UI.
 * Uses upsert: creates a new answer record or updates the existing one.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify the attempt belongs to the current user
  const attempt = await prisma.attempt.findUnique({ where: { id: params.attemptId } });
  if (!attempt || attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { answers } = await req.json() as {
    answers: { questionId: string; selectedOptionId?: string; textAnswer?: string }[];
  };

  // Upsert each answer individually
  for (const ans of answers) {
    const existing = await prisma.answer.findFirst({
      where: { attemptId: params.attemptId, questionId: ans.questionId },
    });

    await prisma.answer.upsert({
      where: { id: existing?.id ?? "new" },
      update: {
        selectedOptionId: ans.selectedOptionId ?? null,
        textAnswer: ans.textAnswer ?? null,
      },
      create: {
        attemptId: params.attemptId,
        questionId: ans.questionId,
        selectedOptionId: ans.selectedOptionId ?? null,
        textAnswer: ans.textAnswer ?? null,
      },
    });
  }

  return NextResponse.json({ saved: true });
}
