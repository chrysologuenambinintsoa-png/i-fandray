const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testLogin() {
  const prisma = new PrismaClient();

  try {
    // Test credentials
    const testEmail = 'test@example.com';
    const testPassword = 'password123'; // Change this to the actual password you used

    console.log('Testing login with:', { email: testEmail, password: testPassword });

    // Find user
    const user = await prisma.user.findFirst({
      where: { email: testEmail },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', { id: user.id, email: user.email, username: user.username });

    // Check password
    const isValid = await bcrypt.compare(testPassword, user.password);
    console.log('Password valid:', isValid);

    if (isValid) {
      console.log('✅ Login should work!');
    } else {
      console.log('❌ Password is incorrect');
      console.log('Stored hash:', user.password);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();