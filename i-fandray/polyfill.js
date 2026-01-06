// Polyfill for self in Node.js environment
if (typeof self === 'undefined') {
  global.self = global;
}

// Execute next build
const { spawn } = require('child_process');
const nextBuild = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true
});

nextBuild.on('close', (code) => {
  process.exit(code);
});

nextBuild.on('error', (error) => {
  console.error('Error running next build:', error);
  process.exit(1);
});