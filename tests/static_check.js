#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'LongShotStitch_v1.8.html');
if (!fs.existsSync(htmlPath)) throw new Error('Missing LongShotStitch_v1.8.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const checks = [
  ['title version', 'LongShotStitch v1.8'],
  ['desktop tool slot', 'desktopToolDockSlot'],
  ['desktop tool panel', 'desktopToolPanel'],
  ['collapsible property section', 'pop-section'],
  ['empty open image button', 'openImageEmpty'],
  ['empty open project button', 'openProjectEmpty'],
  ['tool persistence applyActiveTool', 'applyActiveTool();\n      renderProps(); requestRender();'],
  ['Powerstorm requirements mention', 'POWERSTORM_REQUIREMENTS'],
];

for (const [name, needle] of checks) {
  if (!html.includes(needle)) throw new Error(`Static check failed: ${name}`);
}

const forbidden = [
  "state.toolArmed = 'select';\n      state.toolSettings.group = 'select';",
  '工具栏已移动到画布底部',
  'v1.6',
  '电脑端工具图标放在左侧工具区',
  '选择工具后会保持当前工具，连续绘制不会自动回到选择/移动',
];
for (const needle of forbidden) {
  if (html.includes(needle)) throw new Error(`Forbidden old marker still exists: ${needle}`);
}

console.log('Static check passed: LongShotStitch_v1.8.html');
