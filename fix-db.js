const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const starterCode = {
    javascript: "function isPalindrome(x) {\n  \n}",
    typescript: "function isPalindrome(x: number): boolean {\n  \n}",
    python: "def isPalindrome(x: int) -> bool:\n    ",
    java: "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}",
    cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};"
  };

  await prisma.problem.update({
    where: { id: 9 },
    data: { starterCode: JSON.stringify(starterCode) }
  });
  console.log("Updated starter code for problem 9");
}

main().finally(() => prisma.$disconnect());
