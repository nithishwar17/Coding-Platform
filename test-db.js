const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const prob = await prisma.problem.findUnique({ where: { id: 9 } });
  console.log(JSON.stringify(prob, null, 2));
}

main().finally(() => prisma.$disconnect());
