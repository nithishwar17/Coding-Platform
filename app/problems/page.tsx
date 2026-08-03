import { prisma } from "../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import ProblemsClient from "./ProblemsClient";
import { getDailyChallenge } from "../../lib/dailyChallenge";

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : null;

  const problems = await prisma.problem.findMany();
  
  let userSubmissions: any[] = [];
  if (userId) {
    userSubmissions = await prisma.submission.findMany({
      where: { userId: userId },
      select: { problemId: true, status: true }
    });
  }

  const problemsWithStatus = problems.map(p => {
    const subs = userSubmissions.filter(s => s.problemId === p.id);
    let status = "todo";
    if (subs.length > 0) {
      if (subs.some(s => s.status === "Accepted")) {
        status = "solved";
      } else {
        status = "attempted";
      }
    }
    return { ...p, status };
  });

  const dailyChallenge = await getDailyChallenge();

  return <ProblemsClient problems={problemsWithStatus} dailyChallengeId={dailyChallenge?.id} />;
}
