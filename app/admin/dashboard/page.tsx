"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Test {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  isPublished: boolean;
  _count: { questions: number };
}

export default function AdminDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTests() {
    const res = await fetch("/api/admin/tests");
    const data = await res.json();
    setTests(data);
    setLoading(false);
  }

  useEffect(() => { fetchTests(); }, []);

  async function togglePublish(id: string) {
    const res = await fetch(`/api/admin/tests/${id}/publish`, { method: "PATCH" });
    if (res.ok) {
      toast.success("Test updated");
      fetchTests();
    }
  }

  async function deleteTest(id: string) {
    if (!confirm("Delete this test? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/tests/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Test deleted");
      fetchTests();
    } else {
      toast.error("Failed to delete");
    }
  }

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">All Tests</h1>
        <Link
          href="/admin/tests/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Test
        </Link>
      </div>

      {tests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No tests yet. Create your first one.</div>
      ) : (
        <div className="space-y-3">
          {tests.map((test) => (
            <div key={test.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 truncate">{test.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${test.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {test.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {test.durationMinutes} min · {test._count.questions} questions
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/tests/${test.id}/edit`}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => togglePublish(test.id)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {test.isPublished ? "Unpublish" : "Publish"}
                </button>
                <Link
                  href={`/admin/tests/${test.id}/results`}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Results
                </Link>
                <button
                  onClick={() => deleteTest(test.id)}
                  className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
