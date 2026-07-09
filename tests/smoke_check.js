#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const htmlPath = fs.existsSync(path.join(root, 'LongShotStitch_v1.8.html'))
  ? path.join(root, 'LongShotStitch_v1.8.html')
  : path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const match = html.match(/<script>\s*\(\(\) => \{([\s\S]*)\}\)\(\);\s*<\/script>/);
if (!match) throw new Error('Cannot find main inline script IIFE.');

const tmp = path.join(root, 'tests', '.tmp_longshot_check.js');
fs.writeFileSync(tmp, '(()=>{' + match[1] + '})();');
try {
  execFileSync('node', ['--check', tmp], { stdio: 'pipe' });
} finally {
  fs.rmSync(tmp, { force: true });
}

const required = [
  'function renderToolDock',
  'function groupPopover',
  'function annotationPopover',
  'function beginToolDraw',
  'function handleDroppedFiles',
  'function renderProps',
];
for (const needle of required) {
  if (!html.includes(needle)) throw new Error(`Missing required code marker: ${needle}`);
}

console.log(`Smoke check passed: ${path.basename(htmlPath)}`);
