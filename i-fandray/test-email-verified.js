const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUserCreationWithEmailVerified() {
  try {
    console.log('🧪 Test de création d\'utilisateur avec emailVerified...\n');

    // Simuler les données que NextAuth enverrait maintenant
    const userData = {
      email: 'test-oauth@example.com',
      avatar: 'https://example.com/avatar.jpg',
      firstName: 'Test',
      lastName: 'OAuth',
      username: 'testoauth123',
      emailVerified: new Date() // Nouveau champ ajouté
    };

    console.log('📝 Données à insérer:', userData);

    const user = await prisma.user.create({
      data: userData
    });

    console.log('✅ Utilisateur créé avec succès:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      emailVerified: user.emailVerified
    });

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

testUserCreationWithEmailVerified();