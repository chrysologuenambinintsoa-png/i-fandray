// Script de test complet pour l'authentification
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAuthSystem() {
  console.log('🧪 Test du système d\'authentification i-fandray\n');

  try {
    // 1. Vérifier les utilisateurs existants
    console.log('1. Utilisateurs dans la base de données:');
    const users = await prisma.user.findMany();
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.firstName} ${user.lastName}) - Mot de passe: ${!!user.password ? '✅' : '❌'}`);
    });
    console.log('');

    // 2. Créer un nouvel utilisateur de test si nécessaire
    const testEmail = 'newuser@example.com';
    let testUser = await prisma.user.findUnique({ where: { email: testEmail } });

    if (!testUser) {
      console.log('2. Création d\'un nouvel utilisateur de test...');
      const hashedPassword = await bcrypt.hash('testpass123', 10);

      testUser = await prisma.user.create({
        data: {
          email: testEmail,
          password: hashedPassword,
          firstName: 'New',
          lastName: 'User',
          username: 'newuser'
        }
      });
      console.log('   ✅ Utilisateur créé:', testUser.email);
      console.log('   🔑 Mot de passe: testpass123\n');
    } else {
      console.log('2. Utilisateur de test existe déjà\n');
    }

    // 3. Tester la connexion avec les credentials
    console.log('3. Test de connexion avec credentials:');
    console.log('   📧 Email: newuser@example.com');
    console.log('   🔑 Password: testpass123');
    console.log('   🌐 URL: http://localhost:3000/auth/login\n');

    // 4. Instructions pour l'utilisateur
    console.log('📋 INSTRUCTIONS DE TEST:');
    console.log('');
    console.log('INSCRIPTION:');
    console.log('1. Allez sur: http://localhost:3000/auth/register');
    console.log('2. Remplissez le formulaire avec vos informations');
    console.log('3. Cliquez sur "Sign Up"');
    console.log('4. Vous devriez être automatiquement connecté et redirigé vers /welcome');
    console.log('');

    console.log('CONNEXION:');
    console.log('1. Allez sur: http://localhost:3000/auth/login');
    console.log('2. Utilisez ces credentials:');
    console.log('   - Email: newuser@example.com');
    console.log('   - Password: testpass123');
    console.log('3. Cliquez sur "Sign In"');
    console.log('4. Vous devriez être redirigé vers /feed');
    console.log('');

    console.log('OAUTH (Google/Facebook):');
    console.log('1. Sur la page login/register, cliquez sur "Se connecter avec Google" ou "Se connecter avec Facebook"');
    console.log('2. Suivez le processus OAuth');
    console.log('3. Vous devriez être redirigé vers /feed après authentification');
    console.log('');

    console.log('🔧 CONFIGURATION OAUTH:');
    console.log('Assurez-vous que ces URLs sont configurées dans vos consoles développeurs:');
    console.log('Google: http://localhost:3000/api/auth/callback/google');
    console.log('Facebook: http://localhost:3000/api/auth/callback/facebook');
    console.log('');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthSystem();