import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database for production deployment...');

  // Clean all user-generated content first (to respect foreign key constraints)
  console.log('🗑️  Removing all comments...');
  await prisma.comment.deleteMany();

  console.log('🗑️  Removing all likes...');
  await prisma.like.deleteMany();

  console.log('🗑️  Removing all shares...');
  await prisma.share.deleteMany();

  console.log('🗑️  Removing all friend connections...');
  await prisma.friend.deleteMany();

  console.log('🗑️  Removing all friend requests...');
  await prisma.friendRequest.deleteMany();

  console.log('🗑️  Removing all posts...');
  await prisma.post.deleteMany();

  console.log('🗑️  Removing all stories...');
  await prisma.story.deleteMany();

  console.log('🗑️  Removing all notifications...');
  await prisma.notification.deleteMany();

  console.log('🗑️  Removing all messages...');
  await prisma.message.deleteMany();

  console.log('🗑️  Removing all conversations...');
  await prisma.conversation.deleteMany();

  console.log('🗑️  Removing all groups...');
  await prisma.group.deleteMany();

  console.log('🗑️  Removing all news articles...');
  await prisma.news.deleteMany();

  console.log('🗑️  Removing all user accounts...');
  await prisma.user.deleteMany();

  console.log('🗑️  Removing all blocks...');
  await prisma.block.deleteMany();

  // Create a minimal admin user for system management (optional)
  console.log('👤 Creating minimal admin user...');
  const hashedPassword = await bcrypt.hash('admin123!@#', 10);
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'System',
      lastName: 'Administrator',
      username: 'admin',
      email: 'admin@system.local',
      password: hashedPassword,
      bio: 'System Administrator Account',
      isVerified: true,
      isActive: true,
      language: 'en',
      theme: 'light',
    },
  });

  console.log('✅ Admin user created:', adminUser.username);
  console.log('📧 Admin email: admin@system.local');
  console.log('🔑 Admin password: admin123!@#');

  // Create a few neutral news articles for demonstration
  console.log('📰 Creating minimal neutral news articles...');
  const newsData = [
    {
      title: 'Welcome to i-fandray - Your AI-Powered Social Network',
      content: 'Discover a new way to connect with friends, family, and communities. Our platform leverages artificial intelligence to enhance your social experience with personalized content, smart recommendations, and intelligent community features.',
      summary: 'Welcome to i-fandray, where AI meets social networking for a smarter, more connected experience.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
      source: 'i-fandray Team',
      category: 'announcement',
      url: 'https://i-fandray.com/welcome',
      publishedAt: new Date(),
      authorId: adminUser.id,
    },
    {
      title: 'Privacy and Security: Our Commitment to You',
      content: 'Your privacy and security are our top priorities. We employ industry-leading encryption, secure authentication, and transparent data practices to ensure your personal information remains safe and private.',
      summary: 'Learn about our comprehensive privacy and security measures designed to protect your data.',
      imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800',
      source: 'i-fandray Security',
      category: 'security',
      url: 'https://i-fandray.com/privacy-security',
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
      authorId: adminUser.id,
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({
      data: news,
    });
  }

  console.log('✅ Minimal news articles created');

  console.log('🎉 Database cleaned and ready for production!');
  console.log('📊 Summary:');
  console.log('   - All user-generated content removed');
  console.log('   - All test users deleted');
  console.log('   - Minimal admin account created');
  console.log('   - 2 neutral news articles added');
  console.log('   - Database ready for real users!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });