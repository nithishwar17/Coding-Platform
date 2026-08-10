import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.problem.findFirst({ where: { title: 'Palindrome Number' }, include: { testCases: true } });
  console.dir(p?.testCases, { depth: null });
}
main().finally(() => prisma.$disconnect());
