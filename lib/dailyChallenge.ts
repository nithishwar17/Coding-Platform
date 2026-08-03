import { prisma } from './db';

export async function getDailyChallenge() {
  const problems = await prisma.problem.findMany({
    select: { id: true },
    orderBy: { id: 'asc' }
  });
  
  if (problems.length === 0) return null;
  
  // Predictable daily choice based on date
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const index = seed % problems.length;
  
  const dailyId = problems[index].id;
  return await prisma.problem.findUnique({ where: { id: dailyId } });
}
