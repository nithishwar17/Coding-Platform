const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const problem = await prisma.problem.findUnique({
    where: { id: 9 },
    include: { testCases: true }
  });
  console.log(JSON.stringify(problem.testCases, null, 2));
}
main().finally(() => prisma.$disconnect());
