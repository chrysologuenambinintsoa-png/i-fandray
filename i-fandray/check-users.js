const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users in database:', users.length);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - Has password: ${!!user.password}`);
    });

    // Check if there's at least one user with password
    const usersWithPassword = users.filter(user => user.password);
    if (usersWithPassword.length === 0) {
      console.log('No users with passwords found. Creating a test user with password...');

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

      console.log('✅ Test user created successfully!');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('You can now login with these credentials.');
    } else {
      console.log('✅ Users with passwords exist. You can login with credentials.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();