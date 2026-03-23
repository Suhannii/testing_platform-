/**
 * StartTestButton
 * Client component that creates an attempt via the API and navigates
 * to the test-taking page. Handles the loading state during the request.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  testId: string;
}

export default function StartTestButton({ testId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testId }),
    });

    if (res.ok) {
      const attempt = await res.json();
      // Navigate to the attempt page
      router.push(`/tests/${testId}/attempt/${attempt.id}`);
    } else {
      toast.error("Failed to start test");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleStart}
      disabled={loading}
      className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "Starting..." : "Begin Test"}
    </button>
  );
}
