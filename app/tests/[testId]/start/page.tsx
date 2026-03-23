import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StartTestButton from "./StartTestButton";

export default async function StartTestPage({ params }: { params: { testId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const test = await prisma.test.findUnique({
    where: { id: params.testId, isPublished: true },
    include: { _count: { select: { questions: true } } },
  });

  if (!test) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
        {test.description && <p className="text-gray-500 text-sm mb-6">{test.description}</p>}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{test.durationMinutes}</div>
            <div className="text-xs text-gray-500 mt-1">Minutes</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900">{test._count.questions}</div>
            <div className="text-xs text-gray-500 mt-1">Questions</div>
          </div>
        </div>
        <StartTestButton testId={params.testId} />
      </div>
    </div>
  );
}
