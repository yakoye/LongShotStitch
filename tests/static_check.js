#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LongShotStitch_v1.13.html');
if (!fs.existsSync(htmlPath)) throw new Error('Missing LongShotStitch_v1.13.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const checks = [
  ['title version', 'LongShotStitch v1.13'],
  ['desktop tool slot', 'desktopToolDockSlot'],
  ['compact tool panel', 'pop-compact'],
  ['line width preview', 'line-preview'],
  ['mini map element', 'id="miniMap"'],
  ['mini map canvas', 'id="miniMapCanvas"'],
  ['vertical scrollbar', 'id="vScroll"'],
  ['horizontal scrollbar', 'id="hScroll"'],
  ['mobile tool dock bound above bottom bar', 'bottom:calc(var(--mobilebar) + 6px'],
  ['mobile popover toggle state', 'mobileToolPopoverOpen'],
  ['mobile status hidden in tools', '.app[data-mode=\"tools\"] .statusbar{display:none}'],
  ['navigation updater', 'function updateNavigation'],
  ['visible world rect', 'function visibleWorldRect'],
  ['split visible rule', 'const canAutoFollow = !drag || drag.type === \'pan\';'],
  ['future features doc expected', 'LongShotStitch v1.13'],
  ['ordinary width presets', 'const basePresets = presets || [1,2,4,8];'],
  ['eraser wide presets', "widthControl('eraserSize',s.eraserSize||24,4,120,false,[4,8,16,32])"],
];

for (const [name, needle] of checks) {
  if (!html.includes(needle)) throw new Error(`Static check failed: ${name}`);
}

const forbidden = [
  'LongShotStitch v1.10 - 长图拼接裁剪工具',
  '长图拼裁工具 v1.10',
  'const presets = [1,2,4,8,16,32]',
  '<summary>形状</summary>',
  '<summary>颜色</summary>',
  '<summary>线条</summary>',
  '<summary>类型</summary>',
  '<summary>样式</summary>',
];
for (const needle of forbidden) {
  if (html.includes(needle)) throw new Error(`Forbidden old marker still exists: ${needle}`);
}

console.log('Static check passed: LongShotStitch_v1.13.html');
