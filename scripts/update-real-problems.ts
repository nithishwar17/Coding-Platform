import { PrismaClient } from '@prisma/client';
import { LeetCode } from 'leetcode-query';

const prisma = new PrismaClient();
const lc = new LeetCode();

async function main() {
  console.log("Fetching top 50 problems to get their REAL descriptions and test cases...");
  
  const data = await lc.problems({ limit: 50, offset: 0 });
  const problems = data.questions;

  let count = 0;
  for (const p of problems) {
    console.log(`Fetching details for: ${p.titleSlug}...`);
    try {
      const details = await lc.problem(p.titleSlug);
      
      // We need to parse the HTML to find the first Example's Input and Output
      let input = "1";
      let expectedOutput = "1";
      
      if (details.content) {
        // Try to regex match "Input:</strong> nums = [2,7,11,15], target = 9"
        const inputMatch = details.content.match(/(?:Input:|Input<\/strong>)(.*?)<(?:br|p|\/pre)/i);
        const outputMatch = details.content.match(/(?:Output:|Output<\/strong>)(.*?)<(?:br|p|\/pre)/i);
        
        if (inputMatch && inputMatch[1]) {
          input = inputMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
        }
        if (outputMatch && outputMatch[1]) {
          expectedOutput = outputMatch[1].replace(/<\/?[^>]+(>|$)/g, "").trim();
        }
      }

      const tags = p.topicTags.map((t: any) => t.name).join(', ');

      // Update in DB
      await prisma.problem.updateMany({
        where: { title: p.title },
        data: {
          description: details.content || `<h1>${p.title}</h1><p>Description unavailable.</p>`,
        }
      });

      // Update test cases
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

      count++;
      // Sleep for 200ms to avoid Leetcode rate limiting
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.log(`Failed to fetch ${p.titleSlug}`);
    }
  }

  console.log(`Successfully updated ${count} problems with real data!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
