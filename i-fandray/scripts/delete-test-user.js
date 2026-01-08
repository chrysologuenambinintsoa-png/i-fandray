const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'john@example.com';
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('No user found with email:', email);
      return;
    }

    // Delete dependent records if any (cascades should handle many relations)
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Deleted user:', user.id, email);
  } catch (err) {
    console.error('Error deleting user:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
