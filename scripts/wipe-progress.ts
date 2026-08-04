import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Wiping all fake submissions...");
  
  // Delete all submissions
  const deletedSubmissions = await prisma.submission.deleteMany({});
  console.log(`Deleted ${deletedSubmissions.count} submissions.`);

  console.log("Resetting user stats...");
  
  // Reset all users' xp and streak
  const updatedUsers = await prisma.user.updateMany({
    data: {
      xp: 0,
      streak: 0
    }
  });
  
  console.log(`Reset stats for ${updatedUsers.count} users.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
