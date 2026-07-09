const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('LongShotStitch.html')) {
  throw new Error('index.html must point to LongShotStitch.html');
}

if (!html.includes('<meta http-equiv="refresh"')) {
  throw new Error('index.html must refresh to LongShotStitch.html');
}

console.log('entry_check ok');
