const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'auth', 'register', 'page.tsx');
const text = fs.readFileSync(file, 'utf8');
const lines = text.split('\n');

const opens = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const regex = /<div(?:\s|>)/g;
  let m;
  while ((m = regex.exec(line)) !== null) {
    // ignore self-closing
    if (/\/\s*>\s*$/.test(line) || /<div[^>]*\/\>/.test(line)) {
      // self-closing on same line
      continue;
    }
    opens.push({line: i+1, text: line.trim()});
  }
}

const closes = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const regex = /<\/div>/g;
  let m;
  while ((m = regex.exec(line)) !== null) {
    closes.push({line: i+1, text: line.trim()});
  }
}

console.log('opens:', opens.length, 'closes:', closes.length, 'self-closing skipped');

// naive stack match: assume order
const stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // find opening divs that are not self-closing
  const openRegex = /<div(?:\s|>)/g;
  let m;
  while ((m = openRegex.exec(line)) !== null) {
    if (/\/\s*>\s*$/.test(line) || /<div[^>]*\/\>/.test(line)) continue;
    stack.push({line: i+1, text: line.trim()});
  }
  // find closing
  const closeRegex = /<\/div>/g;
  while ((m = closeRegex.exec(line)) !== null) {
    if (stack.length === 0) {
      console.log('Extra closing at line', i+1);
    } else {
      stack.pop();
    }
  }
}
if (stack.length) {
  console.log('Unclosed opens:');
  stack.forEach(s => console.log('  at line', s.line, ':', s.text));
} else {
  console.log('All divs matched');
}
