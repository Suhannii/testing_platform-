"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Option { id: string; text: string; }
interface Keyword { id: string; word: string; }
interface Question {
  id: string;
  type: "OBJECTIVE" | "SUBJECTIVE";
  text: string;
  options: Option[];
  keywords: Keyword[];
}
interface Attempt {
  id: string;
  startedAt: string;
  test: { title: string; durationMinutes: number; questions: Question[] };
  answers: { questionId: string; selectedOptionId?: string; textAnswer?: string }[];
}

type Answers = Record<string, { selectedOptionId?: string; textAnswer?: string }>;

export default function AttemptPage() {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>();
  const router = useRouter();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then((r) => r.json())
      .then((data: Attempt) => {
        setAttempt(data);
        // Server-synced timer
        const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
        const total = data.test.durationMinutes * 60;
        setTimeLeft(Math.max(0, total - elapsed));

        // Pre-fill saved answers
        const saved: Answers = {};
        data.answers.forEach((a) => {
          saved[a.questionId] = { selectedOptionId: a.selectedOptionId, textAnswer: a.textAnswer };
        });
        setAnswers(saved);
      });
  }, [attemptId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 && attempt) {
      handleSubmit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, attempt]);

  // Auto-save every 30s
  const doAutoSave = useCallback(async () => {
    if (!attempt) return;
    const payload = Object.entries(answers).map(([questionId, ans]) => ({ questionId, ...ans }));
    await fetch(`/api/attempts/${attemptId}/autosave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
  }, [answers, attempt, attemptId]);

  useEffect(() => {
    autoSaveRef.current = setInterval(doAutoSave, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [doAutoSave]);

  async function handleSubmit(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);

    const payload = Object.entries(answers).map(([questionId, ans]) => ({ questionId, ...ans }));
    const res = await fetch(`/api/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });

    if (res.ok) {
      toast.success(auto ? "Time's up! Test submitted." : "Test submitted successfully");
      router.push(`/tests/${testId}/results/${attemptId}`);
    } else {
      toast.error("Submission failed");
      setSubmitting(false);
    }
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading test...</div>
      </div>
    );
  }

  const questions = attempt.test.questions;
  const current = questions[currentIdx];
  const answeredCount = Object.keys(answers).filter((qId) => {
    const a = answers[qId];
    return a.selectedOptionId || (a.textAnswer && a.textAnswer.trim());
  }).length;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const isLow = timeLeft < 300;

  function setAnswer(questionId: string, update: Partial<{ selectedOptionId: string; textAnswer: string }>) {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...update } }));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-semibold text-gray-900 text-sm truncate max-w-xs">{attempt.test.title}</h1>
        <div className="flex items-center gap-4">
          <span className={`font-mono text-sm font-bold ${isLow ? "text-red-600" : "text-gray-700"}`}>
            {mm}:{ss}
          </span>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r border-gray-200 p-3 overflow-y-auto hidden sm:block">
          <p className="text-xs text-gray-400 mb-2 font-medium">Questions</p>
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => {
              const ans = answers[q.id];
              const answered = ans?.selectedOptionId || (ans?.textAnswer && ans.textAnswer.trim());
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    isCurrent ? "bg-blue-600 text-white" :
                    answered ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 inline-block" /> Answered</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Unanswered</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Current</div>
          </div>
        </aside>

        {/* Main question area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-400">Question {currentIdx + 1} of {questions.length}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${current.type === "OBJECTIVE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {current.type}
              </span>
            </div>

            <p className="text-gray-900 font-medium mb-6 text-base leading-relaxed">{current.text}</p>

            {current.type === "OBJECTIVE" ? (
              <div className="space-y-3">
                {current.options.map((opt, i) => {
                  const selected = answers[current.id]?.selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswer(current.id, { selectedOptionId: opt.id })}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                        selected
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <span className="font-medium mr-3 text-gray-400">{String.fromCharCode(65 + i)}.</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={answers[current.id]?.textAnswer ?? ""}
                onChange={(e) => setAnswer(current.id, { textAnswer: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write your answer here..."
              />
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((i) => i + 1)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save & Next
                </button>
              ) : (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Finish Test
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h2 className="font-bold text-gray-900 mb-2">Submit Test?</h2>
            <p className="text-sm text-gray-500 mb-6">
              You have answered {answeredCount} of {questions.length} questions. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
