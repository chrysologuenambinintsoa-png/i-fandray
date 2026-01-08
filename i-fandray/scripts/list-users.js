const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.user.count();
    console.log('USERS_COUNT', count);
    const users = await prisma.user.findMany({ take: 10, select: { id: true, email: true, username: true, firstName: true, lastName: true } });
    console.log('USERS_SAMPLE', users);
  } catch (e) {
    console.error('PRISMA_ERR', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
