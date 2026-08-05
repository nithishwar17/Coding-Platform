const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Study Plans...");

  // Get all problems
  const problems = await prisma.problem.findMany({
    take: 150
  });

  if (problems.length < 50) {
    console.error("Not enough problems in the database. Please run seed-500.ts first.");
    return;
  }

  // Create Study Plan 1: Top 50 Interview
  const plan1 = await prisma.studyPlan.upsert({
    where: { slug: 'top-50-interview' },
    update: {},
    create: {
      title: "Top 50 Interview Questions",
      description: "Must-do list for coding interviews. Covers Arrays, Strings, Trees, and DP.",
      slug: 'top-50-interview'
    }
  });

  // Create Study Plan 2: Beginner's Guide
  const plan2 = await prisma.studyPlan.upsert({
    where: { slug: 'beginners-guide' },
    update: {},
    create: {
      title: "Beginner's Guide",
      description: "New to programming? Start here to build a solid foundation.",
      slug: 'beginners-guide'
    }
  });

  console.log("Created plans, linking problems...");

  // Link first 50 to plan 1
  for (let i = 0; i < 50; i++) {
    await prisma.studyPlanProblem.upsert({
      where: {
        studyPlanId_problemId: {
          studyPlanId: plan1.id,
          problemId: problems[i].id
        }
      },
      update: { order: i },
      create: {
        studyPlanId: plan1.id,
        problemId: problems[i].id,
        order: i
      }
    });
  }

  // Link easy problems to plan 2
  const easyProblems = problems.filter((p: any) => p.difficulty === 'Easy').slice(0, 20);
  for (let i = 0; i < easyProblems.length; i++) {
    await prisma.studyPlanProblem.upsert({
      where: {
        studyPlanId_problemId: {
          studyPlanId: plan2.id,
          problemId: easyProblems[i].id
        }
      },
      update: { order: i },
      create: {
        studyPlanId: plan2.id,
        problemId: easyProblems[i].id,
        order: i
      }
    });
  }

  console.log("Study Plans seeded successfully!");
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
