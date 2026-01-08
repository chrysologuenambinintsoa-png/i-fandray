#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [, , email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: node scripts/login-check.js <email> <password>');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    if (!user.password) {
      console.error('User has no local password (probably social login)');
      process.exit(1);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (valid) {
      console.log('✅ Credentials valid for user:', { id: user.id, email: user.email, username: user.username });
      process.exit(0);
    } else {
      console.error('❌ Invalid password');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during login check:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
