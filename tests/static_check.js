#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LongShotStitch_v1.10.html');
if (!fs.existsSync(htmlPath)) throw new Error('Missing LongShotStitch_v1.10.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const checks = [
  ['title version', 'LongShotStitch v1.10'],
  ['desktop tool slot', 'desktopToolDockSlot'],
  ['compact tool panel', 'pop-compact'],
  ['line width preview', 'line-preview'],
  ['wheel width setting', 'data-tool-width'],
  ['wheel width annotation', 'data-ann-width'],
  ['number width setting', 'width-number'],
  ['watermark helper', 'findExistingWatermarkIndex'],
  ['select annotation helper', 'selectAnnotationForEdit'],
  ['ordinary width presets', 'const basePresets = presets || [1,2,4,8];'],
  ['eraser wide presets', "widthControl('eraserSize',s.eraserSize||24,4,120,false,[4,8,16,32])"],
  ['existing object first', "if(h && (h.type === 'annotationSelect' || h.type === 'annotationResize'))"],
  ['empty open image button', 'openImageEmpty'],
  ['empty open project button', 'openProjectEmpty'],
];

for (const [name, needle] of checks) {
  if (!html.includes(needle)) throw new Error(`Static check failed: ${name}`);
}

const forbidden = [
  'LongShotStitch v1.9 - 长图拼接裁剪工具',
  '长图拼裁工具 v1.9',
  'const presets = [1,2,4,8,16,32]',
  "&& (!h || h.type === 'annotationSelect')){\n      beginToolDraw(state.toolArmed, w);",
  '<summary>形状</summary>',
  '<summary>颜色</summary>',
  '<summary>线条</summary>',
  '<summary>类型</summary>',
  '<summary>样式</summary>',
];
for (const needle of forbidden) {
  if (html.includes(needle)) throw new Error(`Forbidden old marker still exists: ${needle}`);
}

console.log('Static check passed: LongShotStitch_v1.10.html');
