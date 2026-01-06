// Script pour diagnostiquer les problèmes OAuth
console.log('🔍 Diagnostic OAuth - i-fandray');
console.log('=====================================');

// Vérifier les variables d'environnement
console.log('\n📋 Variables d\'environnement OAuth:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Configuré' : '❌ Manquant');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('FACEBOOK_CLIENT_ID:', process.env.FACEBOOK_CLIENT_ID ? '✅ Configuré' : '❌ Manquant');
console.log('FACEBOOK_CLIENT_SECRET:', process.env.FACEBOOK_CLIENT_SECRET ? '✅ Configuré' : '❌ Manquant');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configuré' : '❌ Manquant');

// URLs de redirection attendues
console.log('\n🔗 URLs de redirection OAuth (à configurer dans les consoles développeur):');
console.log('Google:', `${process.env.NEXTAUTH_URL}/api/auth/callback/google`);
console.log('Facebook:', `${process.env.NEXTAUTH_URL}/api/auth/callback/facebook`);

console.log('\n💡 Conseils pour résoudre "Too many requests":');
console.log('1. Vérifiez que les URLs de redirection sont correctement configurées dans:');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - Facebook Developers: https://developers.facebook.com/');
console.log('2. Attendez quelques minutes entre les tentatives OAuth');
console.log('3. Vérifiez que vos clés API ne sont pas limitées');
console.log('4. Testez avec un navigateur en mode incognito');

console.log('\n🚀 Pour tester:');
console.log('- Ouvrez http://localhost:3000/auth/login');
console.log('- Cliquez sur "Continuer avec Google" ou "Continuer avec Facebook"');
console.log('- Vérifiez les logs du serveur pour les détails d\'erreur');