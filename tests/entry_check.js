const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

if (!html.includes('LongShotStitch v1.43.0')) {
  throw new Error('index.html must render the LongShotStitch tool directly');
}

if (html.includes('打开 LongShotStitch')) {
  throw new Error('index.html must not show the intermediate open link');
}

if (html.includes('<meta http-equiv="refresh"')) {
  throw new Error('index.html must not rely on a refresh redirect');
}

console.log('entry_check ok');
