/**
 * Admin Questions API
 *
 * GET  /api/admin/tests/[testId]/questions  — list questions for a test
 * POST /api/admin/tests/[testId]/questions  — add a new question
 *
 * For OBJECTIVE questions, supply `options: [{ text, isCorrect }]`
 * For SUBJECTIVE questions, supply `keywords: string[]`
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

  const questions = await prisma.question.findMany({
    where: { testId: params.testId },
    include: { options: true, keywords: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest, { params }: { params: { testId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, text, topicTag, options, keywords } = await req.json();

  // Auto-assign order based on existing question count
  const count = await prisma.question.count({ where: { testId: params.testId } });

  const question = await prisma.question.create({
    data: {
      testId: params.testId,
      type,
      text,
      topicTag,
      order: count + 1,
      // Create options for objective questions
      options: type === "OBJECTIVE" && options
        ? { create: options.map((o: { text: string; isCorrect: boolean }) => ({ text: o.text, isCorrect: o.isCorrect })) }
        : undefined,
      // Create keywords for subjective questions (stored lowercase)
      keywords: type === "SUBJECTIVE" && keywords
        ? { create: keywords.map((w: string) => ({ word: w.trim().toLowerCase() })) }
        : undefined,
    },
    include: { options: true, keywords: true },
  });

  return NextResponse.json(question, { status: 201 });
}
