const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    if (users.length > 0) {
      console.log('First user:', {
        id: users[0].id,
        email: users[0].email,
        username: users[0].username,
        hasPassword: !!users[0].password
      });
    } else {
      console.log('No users found. Creating a test user...');

      const hashedPassword = await bcrypt.hash('password123', 10);

      const testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser'
        }
      });

      console.log('Test user created:', {
        id: testUser.id,
        email: testUser.email,
        username: testUser.username
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();