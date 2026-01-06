#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration Google OAuth
 * Usage: node test-google-oauth.js
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

console.log('🔍 Vérification de la configuration Google OAuth...\n');

// Vérifier les variables d'environnement
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

let allGood = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName} : NON DÉFINI`);
    allGood = false;
  } else if (value.length < 10) {
    console.log(`⚠️  ${varName} : DÉFINI mais semble trop court (${value.length} caractères)`);
  } else {
    console.log(`✅ ${varName} : DÉFINI (${value.length} caractères)`);
  }
});

// Vérifier la structure du client ID Google
const clientId = process.env.GOOGLE_CLIENT_ID;
if (clientId) {
  if (clientId.includes('.apps.googleusercontent.com')) {
    console.log('✅ GOOGLE_CLIENT_ID : Format valide (se termine par .apps.googleusercontent.com)');
  } else {
    console.log('⚠️  GOOGLE_CLIENT_ID : Format inhabituel (devrait se terminer par .apps.googleusercontent.com)');
  }
}

// Vérifier l'URL NextAuth
const nextAuthUrl = process.env.NEXTAUTH_URL;
if (nextAuthUrl) {
  if (nextAuthUrl.startsWith('http://localhost:')) {
    console.log('✅ NEXTAUTH_URL : Configuration développement détectée');
  } else if (nextAuthUrl.startsWith('https://')) {
    console.log('✅ NEXTAUTH_URL : Configuration production détectée');
  } else {
    console.log('⚠️  NEXTAUTH_URL : Format inhabituel');
  }
}

console.log('\n🔗 URLs importantes pour la configuration Google :');
console.log(`   - Origine JavaScript autorisée : ${nextAuthUrl || 'http://localhost:3000'}`);
console.log(`   - URI de redirection : ${nextAuthUrl || 'http://localhost:3000'}/api/auth/callback/google`);
console.log('   ⚠️  Note : Si le serveur tourne sur un port différent (comme 3002), utilisez cette URL à la place');

console.log('\n📋 Prochaines étapes :');
if (allGood) {
  console.log('✅ Configuration semble correcte. Vérifiez la console Google Cloud.');
} else {
  console.log('❌ Variables manquantes. Vérifiez votre fichier .env.local');
}

console.log('\n🔧 Liens utiles :');
console.log('   - Console Google Cloud : https://console.cloud.google.com/apis/credentials');
console.log('   - Documentation NextAuth : https://next-auth.js.org/providers/google');

console.log('\n🎯 Pour tester :');
console.log('   1. npm run dev');
console.log('   2. Ouvrir http://localhost:3000/auth/login');
console.log('   3. Cliquer sur "Se connecter avec Google"');