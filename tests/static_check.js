const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'LongShotStitch_v1.16.html');
const html = fs.readFileSync(file, 'utf8');
const required = [
  'LongShotStitch v1.16',
  'inlineTextEditor',
  'placeholder="输入文字"',
  'openInlineTextEditor',
  'annotationFrame',
  'rotatePointAround',
  'annotationRotate',
  'textVertical',
  'syncBadgeSequence',
  'c.clip()'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing token: ${token}`);
}
for (const token of ["e.key === '1'", "e.key === '2'", "e.key === '3'", "e.key === '4'", "e.key === '5'"]) {
  if (html.includes(token)) throw new Error(`forbidden shortcut remains: ${token}`);
}
console.log('static_check ok');
