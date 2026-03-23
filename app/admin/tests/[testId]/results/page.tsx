"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Attempt {
  id: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
  user: { name: string; email: string };
}
interface Stats { totalAttempts: number; averageScore: number; highestScore: number; }
interface Test { title: string; durationMinutes: number; }

export default function AdminTestResults() {
  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<{ test: Test & { attempts: Attempt[] }; stats: Stats } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/tests/${testId}/results`)
      .then((r) => r.json())
      .then(setData);
  }, [testId]);

  if (!data) return <div className="h-32 bg-gray-200 rounded-xl animate-pulse" />;

  const { test, stats } = data;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{test.title} — Results</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Attempts", value: stats.totalAttempts },
          { label: "Average Score", value: stats.averageScore.toFixed(2) },
          { label: "Highest Score", value: stats.highestScore.toFixed(2) },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["User", "Score", "Time Taken", "Submitted At", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {test.attempts.map((a) => {
              const timeTaken = a.submittedAt
                ? Math.round((new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 60000)
                : null;
              return (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{a.user.name}</div>
                    <div className="text-gray-400 text-xs">{a.user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{a.score?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{timeTaken != null ? `${timeTaken} min` : "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/results/${a.id}`} className="text-blue-600 hover:underline text-xs">
                      View Detail
                    </Link>
                  </td>
                </tr>
              );
            })}
            {test.attempts.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No submissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
