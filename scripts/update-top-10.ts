import { PrismaClient } from '@prisma/client';
import { LeetCode } from 'leetcode-query';

const prisma = new PrismaClient();
const lc = new LeetCode();

async function main() {
  console.log("Fetching top 10 problems...");
  
  const data = await lc.problems({ limit: 10, offset: 0 });
  const problems = data.questions;

  for (const p of problems) {
    try {
      const details = await lc.problem(p.titleSlug);
      
      let input = "1";
      let expectedOutput = "1";
      
      if (details.content) {
        const inputMatch = details.content.match(/(?:Input:|Input<\/strong>)(.*?)<(?:br|p|\/pre)/i);
        const outputMatch = details.content.match(/(?:Output:|Output<\/strong>)(.*?)<(?:br|p|\/pre)/i);
        
        if (inputMatch && inputMatch[1]) {
          input = inputMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
        }
        if (outputMatch && outputMatch[1]) {
          expectedOutput = outputMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
        }
      }

      await prisma.problem.updateMany({
        where: { title: p.title },
        data: {
          description: details.content || `<h1>${p.title}</h1><p>Description unavailable.</p>`,
        }
      });

      const dbProblem = await prisma.problem.findFirst({ where: { title: p.title } });
      if (dbProblem) {
        await prisma.testCase.deleteMany({ where: { problemId: dbProblem.id } });
        await prisma.testCase.create({
          data: {
            problemId: dbProblem.id,
            input: input,
            expectedOutput: expectedOutput
          }
        });
      }
    } catch (e) {}
  }
  console.log("Done updating top 10 problems.");
}

main().finally(() => prisma.$disconnect());
