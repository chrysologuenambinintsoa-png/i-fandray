import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 Vérification de l\'état de la base de données...\n');

  // Compter les enregistrements dans chaque table
  const counts = {
    users: await prisma.user.count(),
    posts: await prisma.post.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.like.count(),
    friends: await prisma.friend.count(),
    friendRequests: await prisma.friendRequest.count(),
    stories: await prisma.story.count(),
    notifications: await prisma.notification.count(),
    messages: await prisma.message.count(),
    conversations: await prisma.conversation.count(),
    groups: await prisma.group.count(),
    videos: await prisma.video.count(),
    videoLikes: await prisma.videoLike.count(),
    videoComments: await prisma.videoComment.count(),
    blocks: await prisma.block.count(),
  };

  console.log('📊 Nombre d\'enregistrements par table :');
  Object.entries(counts).forEach(([table, count]) => {
    console.log(`   ${table.padEnd(15)}: ${count}`);
  });

  console.log('\n👤 Détails des utilisateurs :');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      isVerified: true,
    },
  });

  users.forEach(user => {
    console.log(`   - ${user.username} (${user.email}) - ${user.isVerified ? '✅ Vérifié' : '❌ Non vérifié'}`);
  });

  console.log('\n🎥 Vidéos :');
  const videos = await prisma.video.findMany({
    select: {
      title: true,
      category: true,
      createdAt: true,
      views: true,
      likes: true,
    },
  });

  videos.forEach(video => {
    console.log(`   - "${video.title}" [${video.category}] - ${video.views} vues, ${video.likes} likes - ${video.createdAt.toLocaleDateString()}`);
  });

  // Vérifications de sécurité
  console.log('\n🔒 Vérifications de sécurité :');
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'email.com' } },
        { username: { contains: 'alex_' } },
        { username: { contains: 'marie_' } },
        { username: { contains: 'thomas_' } },
      ],
    },
  });

  if (testUsers.length === 0) {
    console.log('   ✅ Aucun utilisateur de test trouvé');
  } else {
    console.log(`   ❌ ${testUsers.length} utilisateurs de test encore présents`);
  }

  const totalUserContent = counts.posts + counts.comments + counts.likes + counts.friends + counts.stories;
  console.log(`\n📈 Contenu utilisateur total : ${totalUserContent} éléments`);

  if (totalUserContent === 0) {
    console.log('   ✅ Base de données propre - prête pour la production !');
  } else {
    console.log('   ⚠️  Contenu utilisateur encore présent');
  }

  await prisma.$disconnect();
}

checkDatabaseState().catch(console.error);