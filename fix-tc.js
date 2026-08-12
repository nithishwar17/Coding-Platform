const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.testCase.deleteMany({ where: { problemId: 9 } });
  
  await prisma.testCase.createMany({
    data: [
      { input: JSON.stringify({ x: 121 }), expectedOutput: JSON.stringify(true), isHidden: false, problemId: 9 },
      { input: JSON.stringify({ x: -121 }), expectedOutput: JSON.stringify(false), isHidden: false, problemId: 9 },
      { input: JSON.stringify({ x: 10 }), expectedOutput: JSON.stringify(false), isHidden: false, problemId: 9 }
    ]
  });
  console.log("Updated test cases for problem 9");
}
main().finally(() => prisma.$disconnect());
