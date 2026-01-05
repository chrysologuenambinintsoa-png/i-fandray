const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function hashAndInsert() {
  const password = "TonMotDePasseFort!";

  try {
    // Générer le hash bcrypt avec un salt de 10
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Se connecter à PostgreSQL
    const client = new Client({
      user: 'ifandray_user',
      host: 'localhost',
      database: 'ifandray',
      password: '14octobre1997!', 
      port: 5432,
    });

    await client.connect();

    // Insérer l'utilisateur admin
    const query = `
      INSERT INTO users (email, password, created_at)
      VALUES ($1, $2, NOW())
    `;
    const values = ['roots@ifandray.org', hashedPassword];

    await client.query(query, values);

    console.log('Utilisateur admin inséré avec succès');

    await client.end();
  } catch (error) {
    console.error('Erreur lors de l\'insertion:', error);
  }
}

hashAndInsert();