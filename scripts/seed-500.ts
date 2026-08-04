import { PrismaClient } from '@prisma/client';
import { LeetCode } from 'leetcode-query';

const prisma = new PrismaClient();
const lc = new LeetCode();

async function main() {
  console.log("Fetching top 500 problems from LeetCode...");
  let problems = [];
  for (let i = 0; i < 5; i++) {
    const data = await lc.problems({ limit: 100, skip: i * 100 });
    problems = problems.concat(data.questions);
    console.log(`Fetched ${problems.length} problems so far...`);
  }

  console.log(`Fetched ${problems.length} problems. Saving to database...`);
  
  // Wipe existing problems to avoid duplicates (optional, but good for a clean slate)
  await prisma.submission.deleteMany();
  await prisma.problem.deleteMany();

  let count = 0;
  for (const p of problems) {
    const starterCode = {
      javascript: `function solve(input) {\n  // Implement your solution here\n}`,
      python: `def solve(input):\n    # Implement your solution here\n    pass`,
      java: `class Solution {\n    public void solve(String input) {\n        // Implement your solution here\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Implement your solution here\n    return 0;\n}`
    };

    const tags = p.topicTags.map(t => t.name).join(', ');

    await prisma.problem.create({
      data: {
        title: p.title,
        difficulty: p.difficulty,
        description: `<h1>${p.title}</h1><p>Solve the <b>${p.title}</b> problem on this platform.</p><p>Difficulty: ${p.difficulty}</p><p>Tags: ${tags || 'None'}</p><br/><p><i>Note: The full description and specific test cases for this problem are not included in the dataset, but you can write and run your logic here!</i></p>`,
        tags: tags || "Algorithm",
        starterCode: JSON.stringify(starterCode),
        testCases: {
          create: [{ input: "1", expectedOutput: "1" }]
        }
      }
    });
    count++;
    if (count % 50 === 0) {
      console.log(`Saved ${count} problems...`);
    }
  }

  console.log(`Successfully seeded ${count} LeetCode problems!`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
