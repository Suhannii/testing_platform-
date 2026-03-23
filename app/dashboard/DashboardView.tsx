"use client";

/**
 * DashboardView
 * Client component that handles subject/course filtering and tab switching.
 * Receives pre-fetched tests and attempts from the server component.
 */

import { useState, useMemo } from "react";
import Link from "next/link";

interface Test {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  course: string | null;
  durationMinutes: number;
  isPublished: boolean;
  _count: { questions: number };
}

interface Attempt {
  id: string;
  testId: string;
  score: number | null;
  submittedAt: string | null;
  test: { title: string; subject: string | null; course: string | null };
}

interface Props {
  tests: Test[];
  attempts: Attempt[];
}

// Colour palette for subject badges — cycles through these
const SUBJECT_COLOURS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
];

export default function DashboardView({ tests, attempts }: Props) {
  const [activeTab, setActiveTab] = useState<"tests" | "attempts">("tests");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [selectedCourse, setSelectedCourse] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Derive unique subjects and courses from available tests
  const subjects = useMemo(() => {
    const s = Array.from(new Set(tests.map((t) => t.subject).filter(Boolean))) as string[];
    return ["All", ...s.sort()];
  }, [tests]);

  const courses = useMemo(() => {
    const c = Array.from(new Set(tests.map((t) => t.course).filter(Boolean))) as string[];
    return ["All", ...c.sort()];
  }, [tests]);

  // Build a colour map so each subject always gets the same colour
  const subjectColourMap = useMemo(() => {
    const map: Record<string, string> = {};
    subjects.filter((s) => s !== "All").forEach((s, i) => {
      map[s] = SUBJECT_COLOURS[i % SUBJECT_COLOURS.length];
    });
    return map;
  }, [subjects]);

  // Filter tests based on selected subject, course, and search query
  const filteredTests = useMemo(() => {
    return tests.filter((t) => {
      const matchSubject = selectedSubject === "All" || t.subject === selectedSubject;
      const matchCourse = selectedCourse === "All" || t.course === selectedCourse;
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchCourse && matchSearch;
    });
  }, [tests, selectedSubject, selectedCourse, search]);

  // Group filtered tests by subject for display
  const groupedTests = useMemo(() => {
    const groups: Record<string, Test[]> = {};
    filteredTests.forEach((t) => {
      const key = t.subject || "General";
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [filteredTests]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {(["tests", "attempts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "tests" ? "Available Tests" : "My Attempts"}
            {tab === "tests" && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                {tests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TESTS TAB ── */}
      {activeTab === "tests" && (
        <div className="space-y-6">

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tests..."
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            />

            {/* Subject filter */}
            {subjects.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Subject:</span>
                <div className="flex flex-wrap gap-1">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSubject(s)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedSubject === s
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Course filter */}
            {courses.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Course:</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* No results */}
          {filteredTests.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              No tests found. Try adjusting your filters.
            </div>
          )}

          {/* Tests grouped by subject */}
          {Object.entries(groupedTests).map(([subject, subjectTests]) => (
            <div key={subject}>
              {/* Subject heading */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${subjectColourMap[subject] ?? "bg-gray-100 text-gray-600"}`}>
                  {subject}
                </span>
                <span className="text-xs text-gray-400">{subjectTests.length} test{subjectTests.length !== 1 ? "s" : ""}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Test cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {subjectTests.map((test) => (
                  <div key={test.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 leading-snug">{test.title}</h3>
                      {test.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{test.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {test.course && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {test.course}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">{test.durationMinutes} min</span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-xs text-gray-400">{test._count.questions} questions</span>
                      </div>
                    </div>
                    <Link
                      href={`/tests/${test.id}/start`}
                      className="block text-center py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors mt-2"
                    >
                      Start Test
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ATTEMPTS TAB ── */}
      {activeTab === "attempts" && (
        <div>
          {attempts.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              You haven&apos;t completed any tests yet.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Test", "Subject", "Course", "Score", "Submitted", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attempts.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.test.title}</td>
                      <td className="px-4 py-3">
                        {a.test.subject ? (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${subjectColourMap[a.test.subject] ?? "bg-gray-100 text-gray-600"}`}>
                            {a.test.subject}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{a.test.course ?? "—"}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.score?.toFixed(2) ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/tests/${a.testId}/results/${a.id}`}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
