const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const fallbackEnv = path.join(__dirname, '..', '.env');
let content;
if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
else if (fs.existsSync(fallbackEnv)) content = fs.readFileSync(fallbackEnv, 'utf8');
else {
  console.error('No .env.local or .env found');
  process.exit(1);
}

content.split(/\r?\n/).forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx === -1) return;
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
});

const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });

c.connect()
  .then(() => {
    console.log('PG_OK');
    return c.end();
  })
  .catch(e => {
    console.error('\nPG_ERR_FULL\n');
    console.error(e);
    process.exit(1);
  });
