const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'LongShotStitch_v1.18.html');
const html = fs.readFileSync(file, 'utf8');
const required = [
  'LongShotStitch v1.18',
  'rel="icon"',
  '✂',
  'autoStitchEnabled',
  'inferAutoOrientation',
  'autoAllSeams',
  'subtitleRegion',
  'generateSubtitleStitch',
  'drawSubtitleRegion',
  'cutSettings',
  'exportCutImages',
  'drawCutGuides',
  'downloadCanvasPng',
  'data-mode="subtitle"',
  'data-mode="cut"',
  'openInlineTextEditor(h.index, true)',
  'isLiveTextEdit',
  'Keyboard Backspace/Delete must not remove annotations',
  'Rotate around the same visual frame center used by the blue dashed selection box',
  'textSize:14',
  'fontSize:s.textSize || 14',
  'annotationFrame',
  'annotationRotate',
  'textVertical',
  'syncBadgeSequence',
  'c.clip()'
];
for (const token of required) {
  if (!html.includes(token)) throw new Error(`missing token: ${token}`);
}
for (const token of ["if(state.selected?.type === 'annotation'){ deleteSelectedAnnotation(); return; }", "e.key === '1'", "e.key === '2'", "e.key === '3'", "e.key === '4'", "e.key === '5'"]) {
  if (html.includes(token)) throw new Error(`forbidden token remains: ${token}`);
}
console.log('static_check ok');
