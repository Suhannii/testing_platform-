"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function UserResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}/results`)
      .then((r) => r.json())
      .then(setAttempt);
  }, [attemptId]);

  if (!attempt) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading results...</div>
    </div>
  );

  const totalQ = attempt.answers.length;
  const attempted = attempt.answers.filter((a: any) => a.selectedOptionId || a.textAnswer).length;
  const correct = attempt.answers.filter((a: any) => a.isCorrect === true).length;
  const incorrect = attempt.answers.filter((a: any) => a.isCorrect === false).length;
  const timeTaken = attempt.submittedAt
    ? Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{attempt.test.title}</h1>
          <p className="text-4xl font-bold text-blue-600 mt-3">
            {attempt.score?.toFixed(2)} pts
          </p>
          {timeTaken != null && <p className="text-sm text-gray-400 mt-1">Completed in {timeTaken} minutes</p>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: totalQ, color: "bg-gray-50" },
            { label: "Attempted", value: attempted, color: "bg-blue-50" },
            { label: "Correct", value: correct, color: "bg-green-50" },
            { label: "Incorrect", value: incorrect, color: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {attempt.answers.map((ans: any, i: number) => (
            <div key={ans.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Q{i + 1}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${ans.question.type === "OBJECTIVE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                  {ans.question.type}
                </span>
                {ans.question.type === "OBJECTIVE" && (
                  <span className={`text-xs font-medium ${ans.isCorrect ? "text-green-600" : "text-red-500"}`}>
                    {ans.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 mb-3">{ans.question.text}</p>

              {ans.question.type === "OBJECTIVE" ? (
                <div className="space-y-1">
                  {ans.question.options.map((opt: any) => {
                    const isSelected = opt.id === ans.selectedOptionId;
                    const isCorrect = opt.isCorrect;
                    return (
                      <div key={opt.id} className={`px-3 py-2 rounded-lg text-sm ${
                        isSelected && isCorrect ? "bg-green-50 border border-green-200 text-green-800" :
                        isSelected && !isCorrect ? "bg-red-50 border border-red-200 text-red-800" :
                        isCorrect ? "bg-green-50 border border-green-100 text-green-700" :
                        "bg-gray-50 text-gray-500"
                      }`}>
                        {isSelected && <span className="mr-1">{isCorrect ? "✓" : "✗"}</span>}
                        {isCorrect && !isSelected && <span className="mr-1 text-green-600">✓</span>}
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {ans.textAnswer || <span className="text-gray-400 italic">No answer provided</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    Keywords matched: {ans.keywordScore ?? 0} / {ans.question.keywords.length}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
