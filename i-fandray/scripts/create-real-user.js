#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const [, , firstName, lastName, username, email, password] = process.argv;

  if (!firstName || !lastName || !username || !email || !password) {
    console.error('Usage: node scripts/create-real-user.js <firstName> <lastName> <username> <email> <password>');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      console.error('A user with that email or username already exists.');
      process.exit(1);
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashed,
        isVerified: true,
        isActive: true,
      },
      select: { id: true, email: true, username: true },
    });

    console.log('User created:', user);
  } catch (err) {
    console.error('Error creating user:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
