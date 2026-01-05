const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      }
    });
    console.log('Test user created:', user.email);
  } catch (error) {
    console.log('Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();