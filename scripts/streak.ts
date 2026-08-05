import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found.");
    return;
  }

  const problem = await prisma.problem.findFirst();
  if (!problem) {
    console.log("No problem found.");
    return;
  }

  // Update streak
  await prisma.user.update({
    where: { id: user.id },
    data: {
      streak: 7, // Give them a nice 7-day streak for the visual "steak"
      lastActive: new Date()
    }
  });

  // Add a dummy submission for today so it appears on the heatmap
  await prisma.submission.create({
    data: {
      userId: user.id,
      problemId: problem.id,
      code: "console.log('steak');",
      language: "javascript",
      status: "Accepted",
      executionTime: 12,
      memoryKb: 2048,
      createdAt: new Date()
    }
  });

  console.log(`Successfully updated streak to 7 and added today's submission for user ${user.email}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
