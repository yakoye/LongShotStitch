const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'LongShotStitch_v1.18.html');
if (!fs.existsSync(file)) throw new Error('LongShotStitch_v1.18.html missing');
const html = fs.readFileSync(file, 'utf8');
const m = html.match(/<script>\s*\(\(\) => \{([\s\S]*)\}\)\(\);\s*<\/script>/);
if (!m) throw new Error('main script not found');
new Function(m[1]);
console.log('smoke_check ok');
