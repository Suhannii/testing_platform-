/**
 * Admin Question API
 *
 * PUT    /api/admin/questions/[questionId]  — update question text, options, or keywords
 * DELETE /api/admin/questions/[questionId]  — delete a question
 *
 * On PUT, existing options/keywords are replaced entirely.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { questionId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { text, topicTag, options, keywords } = await req.json();

  // Replace options and keywords with fresh data
  await prisma.option.deleteMany({ where: { questionId: params.questionId } });
  await prisma.keyword.deleteMany({ where: { questionId: params.questionId } });

  const question = await prisma.question.update({
    where: { id: params.questionId },
    data: {
      text,
      topicTag,
      options: options
        ? { create: options.map((o: { text: string; isCorrect: boolean }) => ({ text: o.text, isCorrect: o.isCorrect })) }
        : undefined,
      keywords: keywords
        ? { create: keywords.map((w: string) => ({ word: w.trim().toLowerCase() })) }
        : undefined,
    },
    include: { options: true, keywords: true },
  });

  return NextResponse.json(question);
}

export async function DELETE(_: NextRequest, { params }: { params: { questionId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.question.delete({ where: { id: params.questionId } });
  return NextResponse.json({ success: true });
}
