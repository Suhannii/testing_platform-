"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

interface Option { id?: string; text: string; isCorrect: boolean; }
interface Keyword { id?: string; word: string; }
interface Question {
  id: string;
  type: "OBJECTIVE" | "SUBJECTIVE";
  text: string;
  topicTag: string | null;
  options: Option[];
  keywords: Keyword[];
}
interface Test {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  course: string | null;
  durationMinutes: number;
  questions: Question[];
}

interface NewQuestion {
  type: "OBJECTIVE" | "SUBJECTIVE";
  text: string;
  topicTag: string;
  options: { text: string; isCorrect: boolean }[];
  keywords: never[];
  keywordsRaw?: string;
}

const emptyObjective = (): NewQuestion => ({
  type: "OBJECTIVE",
  text: "",
  topicTag: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  keywords: [],
});

const emptySubjective = (): NewQuestion => ({
  type: "SUBJECTIVE",
  text: "",
  topicTag: "",
  options: [],
  keywords: [],
  keywordsRaw: "",
});

export default function EditTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [details, setDetails] = useState({ title: "", description: "", subject: "", course: "", durationMinutes: "30" });
  const [savingDetails, setSavingDetails] = useState(false);
  const [addingType, setAddingType] = useState<"OBJECTIVE" | "SUBJECTIVE" | null>(null);
  const [newQ, setNewQ] = useState<NewQuestion | null>(null);
  const [savingQ, setSavingQ] = useState(false);

  async function fetchTest() {
    const res = await fetch(`/api/admin/tests/${testId}`);
    const data = await res.json();
    setTest(data);
    setDetails({ title: data.title, description: data.description ?? "", subject: data.subject ?? "", course: data.course ?? "", durationMinutes: String(data.durationMinutes) });
  }

  useEffect(() => { fetchTest(); }, [testId]);

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    setSavingDetails(true);
    const res = await fetch(`/api/admin/tests/${testId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...details, durationMinutes: Number(details.durationMinutes) }),
    });
    setSavingDetails(false);
    if (res.ok) toast.success("Test details saved");
    else toast.error("Failed to save");
  }

  function startAddQuestion(type: "OBJECTIVE" | "SUBJECTIVE") {
    setAddingType(type);
    setNewQ(type === "OBJECTIVE" ? emptyObjective() : { ...emptySubjective() });
  }

  async function saveQuestion() {
    if (!newQ) return;
    setSavingQ(true);

    const payload = {
      type: newQ.type,
      text: newQ.text,
      topicTag: newQ.topicTag,
      options: newQ.type === "OBJECTIVE" ? newQ.options : undefined,
      keywords: newQ.type === "SUBJECTIVE" && newQ.keywordsRaw
        ? newQ.keywordsRaw.split(",").map((k: string) => k.trim()).filter(Boolean)
        : undefined,
    };

    const res = await fetch(`/api/admin/tests/${testId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingQ(false);
    if (res.ok) {
      toast.success("Question added");
      setAddingType(null);
      setNewQ(null);
      fetchTest();
    } else {
      toast.error("Failed to add question");
    }
  }

  async function deleteQuestion(qId: string) {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${qId}`, { method: "DELETE" });
    if (res.ok) { toast.success("Question deleted"); fetchTest(); }
    else toast.error("Failed to delete");
  }

  if (!test) return <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Section A: Test Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Test Details</h2>
        <form onSubmit={saveDetails} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={details.title}
              onChange={(e) => setDetails({ ...details, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={details.description}
              onChange={(e) => setDetails({ ...details, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={details.subject}
                onChange={(e) => setDetails({ ...details, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                type="text"
                value={details.course}
                onChange={(e) => setDetails({ ...details, course: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. B.Sc Year 1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={details.durationMinutes}
              onChange={(e) => setDetails({ ...details, durationMinutes: e.target.value })}
              min={1}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={savingDetails}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {savingDetails ? "Saving..." : "Save Details"}
          </button>
        </form>
      </div>

      {/* Section B: Questions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Questions ({test.questions.length})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => startAddQuestion("OBJECTIVE")}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Objective
            </button>
            <button
              onClick={() => startAddQuestion("SUBJECTIVE")}
              className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Subjective
            </button>
          </div>
        </div>

        {/* Existing questions */}
        <div className="space-y-2 mb-4">
          {test.questions.map((q, i) => (
            <div key={q.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400">Q{i + 1}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${q.type === "OBJECTIVE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                    {q.type}
                  </span>
                  {q.topicTag && <span className="text-xs text-gray-400">{q.topicTag}</span>}
                </div>
                <p className="text-sm text-gray-800 truncate">{q.text}</p>
              </div>
              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-xs text-red-500 hover:text-red-700 flex-shrink-0"
              >
                Delete
              </button>
            </div>
          ))}
          {test.questions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No questions yet.</p>
          )}
        </div>

        {/* Add question form */}
        {addingType && newQ && (
          <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">
              New {addingType === "OBJECTIVE" ? "Objective" : "Subjective"} Question
            </h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Question Text</label>
              <textarea
                value={newQ.text}
                onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Enter question..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Topic Tag (optional)</label>
              <input
                type="text"
                value={newQ.topicTag}
                onChange={(e) => setNewQ({ ...newQ, topicTag: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Arrays"
              />
            </div>

            {addingType === "OBJECTIVE" && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600">Options (select correct one)</label>
                {newQ.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={opt.isCorrect}
                      onChange={() => setNewQ({
                        ...newQ,
                        options: newQ.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
                      })}
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-gray-500 w-4">{String.fromCharCode(65 + idx)}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => setNewQ({
                        ...newQ,
                        options: newQ.options.map((o, i) => i === idx ? { ...o, text: e.target.value } : o),
                      })}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>
            )}

            {addingType === "SUBJECTIVE" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={newQ.keywordsRaw ?? ""}
                  onChange={(e) => setNewQ({ ...newQ, keywordsRaw: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. photosynthesis, chlorophyll, sunlight"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={saveQuestion}
                disabled={savingQ}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {savingQ ? "Saving..." : "Save Question"}
              </button>
              <button
                onClick={() => { setAddingType(null); setNewQ(null); }}
                className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
