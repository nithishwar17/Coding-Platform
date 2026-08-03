import { prisma } from "../../lib/db";
import PlaygroundClient from "./PlaygroundClient";
import { redirect } from "next/navigation";

export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const problemId = resolvedParams.id;

  if (!problemId) {
    redirect("/problems");
  }

  const problem = await prisma.problem.findUnique({
    where: { id: parseInt(problemId) },
    include: { testCases: true },
  });

  if (!problem) {
    return <div>Problem not found</div>;
  }

  return <PlaygroundClient problem={problem} />;
}
