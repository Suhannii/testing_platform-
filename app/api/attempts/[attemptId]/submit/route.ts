/**
 * POST /api/attempts/[attemptId]/submit
 * Finalises an attempt and calculates the score.
 *
 * Scoring logic:
 * - OBJECTIVE: 1 point for a correct option selection
 * - SUBJECTIVE: partial credit = matched keywords / total keywords
 *
 * Existing draft answers are deleted and replaced with scored records.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { attemptId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: {
      test: {
        include: {
          questions: { include: { options: true, keywords: true } },
        },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (attempt.status === "SUBMITTED") {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const { answers } = await req.json() as {
    answers: { questionId: string; selectedOptionId?: string; textAnswer?: string }[];
  };

  let totalScore = 0;
  const answerCreates = [];

  for (const q of attempt.test.questions) {
    const submitted = answers.find((a) => a.questionId === q.id);

    if (q.type === "OBJECTIVE") {
      const correctOption = q.options.find((o: { isCorrect: boolean }) => o.isCorrect);
      const isCorrect = submitted?.selectedOptionId
        ? submitted.selectedOptionId === correctOption?.id
        : false;

      if (isCorrect) totalScore += 1;

      answerCreates.push({
        attemptId: params.attemptId,
        questionId: q.id,
        selectedOptionId: submitted?.selectedOptionId ?? null,
        isCorrect,
      });
    } else {
      // Subjective: count how many keywords appear in the answer text
      const text = submitted?.textAnswer?.toLowerCase() ?? "";
      const matched = q.keywords.filter((k: { word: string }) => text.includes(k.word)).length;
      const keywordScore = matched;

      // Partial credit proportional to keyword coverage
      totalScore += q.keywords.length > 0 ? matched / q.keywords.length : 0;

      answerCreates.push({
        attemptId: params.attemptId,
        questionId: q.id,
        textAnswer: submitted?.textAnswer ?? null,
        keywordScore,
      });
    }
  }

  // Replace any autosaved answers with final scored answers
  await prisma.answer.deleteMany({ where: { attemptId: params.attemptId } });
  await prisma.answer.createMany({ data: answerCreates });

  const updated = await prisma.attempt.update({
    where: { id: params.attemptId },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      score: Math.round(totalScore * 100) / 100,
    },
  });

  return NextResponse.json(updated);
}
