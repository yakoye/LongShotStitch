const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '..', 'LongShotStitch_v1.19.html');
const html = fs.readFileSync(file, 'utf8');
const required = [
  'LongShotStitch v1.19',
  'rel="icon"',
  '✂',
  'autoStitchEnabled',
  'inferAutoOrientation',
  'autoAllSeams',
  'subtitleRegion',
  'generateSubtitleStitch',
  'drawSubtitleRegion',
  'cutSettings',
  'cutLines',
  'ensureCutLines',
  'resetCutLines',
  'completeCutEditing',
  'mobileToolGroupTap',
  'openMobileTextEditor',
  'exportCurrent',
  'exportFormatSelect',
  'exportFormat',
  'downloadCanvasImage',
  'canvasToSvgBlob',
  'keepSeamAnchor',
  'anchorScreen',
  'exportCutImages',
  'drawCutGuides',
  'downloadCanvasPng',
  'data-mode="subtitle"',
  'data-mode="cut"',
  'openInlineTextEditor(h.index, true)',
  '${base}_${rowLabel}_${colLabel}',
  'drag.type === \'cutLine\'',
  'drag.type === \'seamBefore\'',
  'drag.type === \'seamAfter\'',
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
for (const token of ["if(state.selected?.type === 'annotation'){ deleteSelectedAnnotation(); return; }", "e.key === '1'", "e.key === '2'", "e.key === '3'", "e.key === '4'", "e.key === '5'", "导出 PNG", "<div class=\"mobile-title\">裁剪</div>"]) {
  if (html.includes(token)) throw new Error(`forbidden token remains: ${token}`);
}
console.log('static_check ok');
