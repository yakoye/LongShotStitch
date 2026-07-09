const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'LongShotStitch_v1.17.html');
const html = fs.readFileSync(file, 'utf8');
const required = [
  'LongShotStitch v1.17',
  'syncToolSettingsFromAnnotation',
  '文字回到稳定的属性面板编辑方式',
  "s.shapeKind === 'circle'",
  "s.penKind === 'highlight'",
  "s.arrowKind || 'arrow'",
  "s.mosaicKind === 'free'",
  'annotationFrame',
  'annotationRotate',
  'textVertical',
  'syncBadgeSequence',
  'c.clip()'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing token: ${token}`);
}
for (const token of ['openInlineTextEditor(idx, false)', "if(a?.type === 'text') openInlineTextEditor"]) {
  if (html.includes(token)) throw new Error(`inline editor invocation remains: ${token}`);
}
for (const token of ["e.key === '1'", "e.key === '2'", "e.key === '3'", "e.key === '4'", "e.key === '5'"]) {
  if (html.includes(token)) throw new Error(`forbidden shortcut remains: ${token}`);
}
console.log('static_check ok');
