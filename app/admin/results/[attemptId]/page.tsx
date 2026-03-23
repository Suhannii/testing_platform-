"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AdminAttemptDetail() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}/results`)
      .then((r) => r.json())
      .then(setAttempt);
  }, [attemptId]);

  if (!attempt) return <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />;

  const timeTaken = attempt.submittedAt
    ? Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)
    : null;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{attempt.test.title}</h1>
          <p className="text-sm text-gray-500">{attempt.user.name} · {attempt.user.email}</p>
        </div>
        <Link href={`/admin/tests/${attempt.testId}/results`} className="text-sm text-blue-600 hover:underline">
          ← Back to Results
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{attempt.score?.toFixed(2) ?? "—"}</div>
          <div className="text-sm text-gray-500">Score</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{timeTaken != null ? `${timeTaken}m` : "—"}</div>
          <div className="text-sm text-gray-500">Time Taken</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{attempt.answers.length}</div>
          <div className="text-sm text-gray-500">Answered</div>
        </div>
      </div>

      <div className="space-y-3">
        {attempt.answers.map((ans: any, i: number) => (
          <div key={ans.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400">Q{i + 1}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${ans.question.type === "OBJECTIVE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {ans.question.type}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-3">{ans.question.text}</p>

            {ans.question.type === "OBJECTIVE" ? (
              <div className="space-y-1">
                {ans.question.options.map((opt: any) => {
                  const isSelected = opt.id === ans.selectedOptionId;
                  const isCorrect = opt.isCorrect;
                  return (
                    <div key={opt.id} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                      isSelected && isCorrect ? "bg-green-50 border border-green-200 text-green-800" :
                      isSelected && !isCorrect ? "bg-red-50 border border-red-200 text-red-800" :
                      isCorrect ? "bg-green-50 border border-green-100 text-green-700" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      {isSelected && <span>{isCorrect ? "✓" : "✗"}</span>}
                      {opt.text}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <span className="text-xs font-medium text-gray-500 block mb-1">Answer:</span>
                  {ans.textAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                </div>
                <div className="text-xs text-gray-500">
                  Keywords matched: {ans.keywordScore ?? 0} / {ans.question.keywords.length}
                  <span className="ml-2 text-gray-400">
                    ({ans.question.keywords.map((k: any) => k.word).join(", ")})
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
