#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LongShotStitch_v1.9.html');
if (!fs.existsSync(htmlPath)) throw new Error('Missing LongShotStitch_v1.9.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const checks = [
  ['title version', 'LongShotStitch v1.9'],
  ['desktop tool slot', 'desktopToolDockSlot'],
  ['desktop tool panel', 'desktopToolPanel'],
  ['compact tool panel', 'pop-compact'],
  ['line width preview', 'line-preview'],
  ['wheel width setting', 'data-tool-width'],
  ['wheel width annotation', 'data-ann-width'],
  ['number width setting', 'width-number'],
  ['empty open image button', 'openImageEmpty'],
  ['empty open project button', 'openProjectEmpty'],
  ['tool persistence applyActiveTool', 'applyActiveTool();\n      renderProps(); requestRender();'],
];

for (const [name, needle] of checks) {
  if (!html.includes(needle)) throw new Error(`Static check failed: ${name}`);
}

const forbidden = [
  "state.toolArmed = 'select';\n      state.toolSettings.group = 'select';",
  '工具栏已移动到画布底部',
  'LongShotStitch v1.8',
  '电脑端工具图标放在左侧工具区',
  '选择工具后会保持当前工具，连续绘制不会自动回到选择/移动',
  '<summary>形状</summary>',
  '<summary>颜色</summary>',
  '<summary>线条</summary>',
  '<summary>类型</summary>',
  '<summary>样式</summary>',
];
for (const needle of forbidden) {
  if (html.includes(needle)) throw new Error(`Forbidden old marker still exists: ${needle}`);
}

console.log('Static check passed: LongShotStitch_v1.9.html');
