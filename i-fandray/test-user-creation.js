const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserCreation() {
  try {
    console.log('🧪 Test de création d\'utilisateur OAuth...\n');

    // Simuler les données que NextAuth enverrait
    const userData = {
      email: 'test@example.com',
      avatar: 'https://example.com/avatar.jpg',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser123'
    };

    console.log('📝 Données à insérer:', userData);

    const user = await prisma.user.create({
      data: userData
    });

    console.log('✅ Utilisateur créé avec succès:', user);

    // Nettoyer
    await prisma.user.delete({
      where: { id: user.id }
    });

    console.log('🧹 Test user nettoyé');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();