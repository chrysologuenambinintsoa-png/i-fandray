import { PrismaClient } from '@prisma/client';

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

  console.log('🗑️  Removing all video comments...');
  await prisma.videoComment.deleteMany();

  console.log('🗑️  Removing all video likes...');
  await prisma.videoLike.deleteMany();

  console.log('🗑️  Removing all videos...');
  await prisma.video.deleteMany();

  console.log('🗑️  Removing all user accounts...');
  await prisma.user.deleteMany();

  console.log('🗑️  Removing all blocks...');
  await prisma.block.deleteMany();

  console.log('🎉 Database cleaned and ready for production!');
  console.log('📊 Summary:');
  console.log('   - All user-generated content removed');
  console.log('   - All test users deleted');
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